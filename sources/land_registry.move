module veridia::land_registry {
    use std::string::String;
    use std::signer;
    use std::error;
    use aptos_framework::event;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_std::table::{Self, Table};

    // Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_LAND_NOT_FOUND: u64 = 2;
    const E_LAND_ALREADY_EXISTS: u64 = 3;
    const E_INVALID_STATUS: u64 = 4;
    const E_REGISTRY_NOT_INITIALIZED: u64 = 5;

    // Land status enum values
    const STATUS_ACTIVE: u8 = 0;
    const STATUS_FROZEN: u8 = 1;
    const STATUS_DISPUTED: u8 = 2;

    /// Represents the status of a land parcel
    struct LandStatus has store, copy, drop {
        value: u8,
    }

    /// Represents a registered land parcel
    struct Land has store, copy, drop {
        id: u64,
        owner: address,
        jurisdiction: String,
        metadata_hash: String,
        status: LandStatus,
        registered_at: u64,
    }

    /// Global registry to store all lands
    struct LandRegistry has key {
        lands: Table<u64, Land>,
        next_land_id: u64,
        land_registered_events: event::EventHandle<LandRegisteredEvent>,
        status_changed_events: event::EventHandle<StatusChangedEvent>,
        ownership_transferred_events: event::EventHandle<OwnershipTransferredEvent>,
    }

    /// Event emitted when a land is registered
    struct LandRegisteredEvent has drop, store {
        land_id: u64,
        owner: address,
        jurisdiction: String,
        metadata_hash: String,
        timestamp: u64,
    }

    /// Event emitted when land status changes
    struct StatusChangedEvent has drop, store {
        land_id: u64,
        old_status: u8,
        new_status: u8,
        changed_by: address,
        timestamp: u64,
    }

    /// Event emitted when ownership is transferred
    struct OwnershipTransferredEvent has drop, store {
        land_id: u64,
        old_owner: address,
        new_owner: address,
        transferred_by: address,
        timestamp: u64,
    }

    /// Initialize the land registry (should be called once by the module owner)
    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        assert!(!exists<LandRegistry>(account_addr), error::already_exists(E_LAND_ALREADY_EXISTS));
        
        move_to(account, LandRegistry {
            lands: table::new(),
            next_land_id: 1,
            land_registered_events: account::new_event_handle<LandRegisteredEvent>(account),
            status_changed_events: account::new_event_handle<StatusChangedEvent>(account),
            ownership_transferred_events: account::new_event_handle<OwnershipTransferredEvent>(account),
        });
    }

    /// Register a new land parcel
    public entry fun register_land(
        account: &signer,
        owner: address,
        jurisdiction: String,
        metadata_hash: String,
    ) acquires LandRegistry {
        let account_addr = signer::address_of(account);
        assert!(exists<LandRegistry>(account_addr), error::not_found(E_REGISTRY_NOT_INITIALIZED));
        
        let registry = borrow_global_mut<LandRegistry>(account_addr);
        let land_id = registry.next_land_id;
        
        // Create new land record
        let land = Land {
            id: land_id,
            owner,
            jurisdiction,
            metadata_hash,
            status: LandStatus { value: STATUS_ACTIVE },
            registered_at: timestamp::now_microseconds(),
        };
        
        // Store the land
        table::add(&mut registry.lands, land_id, land);
        registry.next_land_id = land_id + 1;
        
        // Emit event
        event::emit_event(&mut registry.land_registered_events, LandRegisteredEvent {
            land_id,
            owner,
            jurisdiction,
            metadata_hash,
            timestamp: timestamp::now_microseconds(),
        });
    }

    /// Transfer ownership of a land parcel
    public entry fun transfer_ownership(
        account: &signer,
        land_id: u64,
        new_owner: address,
    ) acquires LandRegistry {
        let account_addr = signer::address_of(account);
        assert!(exists<LandRegistry>(account_addr), error::not_found(E_REGISTRY_NOT_INITIALIZED));
        
        let registry = borrow_global_mut<LandRegistry>(account_addr);
        assert!(table::contains(&registry.lands, land_id), error::not_found(E_LAND_NOT_FOUND));
        
        let land = table::borrow_mut(&mut registry.lands, land_id);
        let old_owner = land.owner;
        
        // For now, allow the registry owner to transfer any land
        // In production, you might want to add ownership checks
        land.owner = new_owner;
        
        // Emit event
        event::emit_event(&mut registry.ownership_transferred_events, OwnershipTransferredEvent {
            land_id,
            old_owner,
            new_owner,
            transferred_by: signer::address_of(account),
            timestamp: timestamp::now_microseconds(),
        });
    }

    /// Update the status of a land parcel
    public entry fun update_status(
        account: &signer,
        land_id: u64,
        new_status: u8,
    ) acquires LandRegistry {
        let account_addr = signer::address_of(account);
        assert!(exists<LandRegistry>(account_addr), error::not_found(E_REGISTRY_NOT_INITIALIZED));
        assert!(is_valid_status(new_status), error::invalid_argument(E_INVALID_STATUS));
        
        let registry = borrow_global_mut<LandRegistry>(account_addr);
        assert!(table::contains(&registry.lands, land_id), error::not_found(E_LAND_NOT_FOUND));
        
        let land = table::borrow_mut(&mut registry.lands, land_id);
        let old_status = land.status.value;
        
        land.status.value = new_status;
        
        // Emit event
        event::emit_event(&mut registry.status_changed_events, StatusChangedEvent {
            land_id,
            old_status,
            new_status,
            changed_by: signer::address_of(account),
            timestamp: timestamp::now_microseconds(),
        });
    }

    /// Helper function to validate status values
    fun is_valid_status(status: u8): bool {
        status == STATUS_ACTIVE || status == STATUS_FROZEN || status == STATUS_DISPUTED
    }

    /// Create a LandStatus from u8 value
    public fun create_status(value: u8): LandStatus {
        assert!(is_valid_status(value), error::invalid_argument(E_INVALID_STATUS));
        LandStatus { value }
    }

    // View functions for querying data

    #[view]
    public fun get_land(registry_addr: address, land_id: u64): Land acquires LandRegistry {
        assert!(exists<LandRegistry>(registry_addr), error::not_found(E_REGISTRY_NOT_INITIALIZED));
        let registry = borrow_global<LandRegistry>(registry_addr);
        assert!(table::contains(&registry.lands, land_id), error::not_found(E_LAND_NOT_FOUND));
        *table::borrow(&registry.lands, land_id)
    }

    #[view]
    public fun get_next_land_id(registry_addr: address): u64 acquires LandRegistry {
        assert!(exists<LandRegistry>(registry_addr), error::not_found(E_REGISTRY_NOT_INITIALIZED));
        let registry = borrow_global<LandRegistry>(registry_addr);
        registry.next_land_id
    }

    #[view]
    public fun land_exists(registry_addr: address, land_id: u64): bool acquires LandRegistry {
        if (!exists<LandRegistry>(registry_addr)) {
            return false
        };
        let registry = borrow_global<LandRegistry>(registry_addr);
        table::contains(&registry.lands, land_id)
    }

    #[view]
    public fun get_land_owner(registry_addr: address, land_id: u64): address acquires LandRegistry {
        let land = get_land(registry_addr, land_id);
        land.owner
    }

    #[view]
    public fun get_land_status(registry_addr: address, land_id: u64): u8 acquires LandRegistry {
        let land = get_land(registry_addr, land_id);
        land.status.value
    }

    #[view]
    public fun get_land_jurisdiction(registry_addr: address, land_id: u64): String acquires LandRegistry {
        let land = get_land(registry_addr, land_id);
        land.jurisdiction
    }

    #[view]
    public fun get_land_metadata_hash(registry_addr: address, land_id: u64): String acquires LandRegistry {
        let land = get_land(registry_addr, land_id);
        land.metadata_hash
    }

    // Status constants for external use
    public fun status_active(): u8 { STATUS_ACTIVE }
    public fun status_frozen(): u8 { STATUS_FROZEN }
    public fun status_disputed(): u8 { STATUS_DISPUTED }
}
