#[test_only]
module veridia::land_registry_tests {
    use std::string;
    use std::signer;
    use veridia::land_registry;

    #[test(admin = @veridia, aptos_framework = @aptos_framework)]
    public entry fun test_initialize_registry(admin: signer, aptos_framework: signer) {
        // Initialize timestamp for testing
        aptos_framework::timestamp::set_time_has_started_for_testing(&aptos_framework);
        
        // Initialize the registry
        land_registry::initialize(&admin);
        
        // Verify next land ID starts at 1
        let admin_addr = signer::address_of(&admin);
        assert!(land_registry::get_next_land_id(admin_addr) == 1, 1);
    }

    #[test(admin = @veridia, aptos_framework = @aptos_framework)]
    public entry fun test_register_land(admin: signer, aptos_framework: signer) {
        // Initialize timestamp and registry
        aptos_framework::timestamp::set_time_has_started_for_testing(&aptos_framework);
        land_registry::initialize(&admin);
        
        let admin_addr = signer::address_of(&admin);
        let owner = @0x123;
        let jurisdiction = string::utf8(b"California, USA");
        let metadata_hash = string::utf8(b"QmHash123456789abcdef");
        
        // Register a land
        land_registry::register_land(&admin, owner, jurisdiction, metadata_hash);
        
        // Verify land was registered
        assert!(land_registry::land_exists(admin_addr, 1), 2);
        assert!(land_registry::get_land_owner(admin_addr, 1) == owner, 3);
        assert!(land_registry::get_land_status(admin_addr, 1) == land_registry::status_active(), 4);
        assert!(land_registry::get_next_land_id(admin_addr) == 2, 5);
    }

    #[test(admin = @veridia, owner = @0x123, aptos_framework = @aptos_framework)]
    public entry fun test_transfer_ownership(admin: signer, owner: signer, aptos_framework: signer) {
        // Initialize timestamp and registry
        aptos_framework::timestamp::set_time_has_started_for_testing(&aptos_framework);
        land_registry::initialize(&admin);
        
        let admin_addr = signer::address_of(&admin);
        let original_owner = signer::address_of(&owner);
        let new_owner = @0x456;
        let jurisdiction = string::utf8(b"California, USA");
        let metadata_hash = string::utf8(b"QmHash123456789abcdef");
        
        // Register a land
        land_registry::register_land(&admin, original_owner, jurisdiction, metadata_hash);
        
        // Test self-transfer by owner
        land_registry::self_transfer_ownership(&owner, admin_addr, 1, new_owner);
        
        // Verify ownership was transferred
        assert!(land_registry::get_land_owner(admin_addr, 1) == new_owner, 6);
    }

    #[test(admin = @veridia, aptos_framework = @aptos_framework)]
    public entry fun test_update_status(admin: signer, aptos_framework: signer) {
        // Initialize timestamp and registry
        aptos_framework::timestamp::set_time_has_started_for_testing(&aptos_framework);
        land_registry::initialize(&admin);
        
        let admin_addr = signer::address_of(&admin);
        let owner = @0x123;
        let jurisdiction = string::utf8(b"California, USA");
        let metadata_hash = string::utf8(b"QmHash123456789abcdef");
        
        // Register a land
        land_registry::register_land(&admin, owner, jurisdiction, metadata_hash);
        
        // Update status to frozen
        land_registry::update_status(&admin, 1, land_registry::status_frozen());
        
        // Verify status was updated
        assert!(land_registry::get_land_status(admin_addr, 1) == land_registry::status_frozen(), 7);
        
        // Update status to disputed
        land_registry::update_status(&admin, 1, land_registry::status_disputed());
        assert!(land_registry::get_land_status(admin_addr, 1) == land_registry::status_disputed(), 8);
    }

    #[test(admin = @veridia, aptos_framework = @aptos_framework)]
    #[expected_failure(abort_code = 0x60002, location = veridia::land_registry)]
    public entry fun test_get_nonexistent_land(admin: signer, aptos_framework: signer) {
        // Initialize timestamp and registry
        aptos_framework::timestamp::set_time_has_started_for_testing(&aptos_framework);
        land_registry::initialize(&admin);
        
        let admin_addr = signer::address_of(&admin);
        
        // Try to get a land that doesn't exist
        land_registry::get_land_info(admin_addr, 999);
    }

    #[test(admin = @veridia, aptos_framework = @aptos_framework)]
    #[expected_failure(abort_code = 0x10004, location = veridia::land_registry)]
    public entry fun test_invalid_status(admin: signer, aptos_framework: signer) {
        // Initialize timestamp and registry
        aptos_framework::timestamp::set_time_has_started_for_testing(&aptos_framework);
        land_registry::initialize(&admin);
        
        let owner = @0x123;
        let jurisdiction = string::utf8(b"California, USA");
        let metadata_hash = string::utf8(b"QmHash123456789abcdef");
        
        // Register a land
        land_registry::register_land(&admin, owner, jurisdiction, metadata_hash);
        
        // Try to update with invalid status (should fail)
        land_registry::update_status(&admin, 1, 99);
    }

    #[test(admin = @veridia, owner = @0x123, stranger = @0x789, aptos_framework = @aptos_framework)]
    #[expected_failure(abort_code = 0x50001, location = veridia::land_registry)]
    public entry fun test_unauthorized_transfer(admin: signer, owner: signer, stranger: signer, aptos_framework: signer) {
        // Initialize timestamp and registry
        aptos_framework::timestamp::set_time_has_started_for_testing(&aptos_framework);
        land_registry::initialize(&admin);
        
        let admin_addr = signer::address_of(&admin);
        let owner_addr = signer::address_of(&owner);
        let new_owner = @0x456;
        let jurisdiction = string::utf8(b"California, USA");
        let metadata_hash = string::utf8(b"QmHash123456789abcdef");
        
        // Register a land
        land_registry::register_land(&admin, owner_addr, jurisdiction, metadata_hash);
        
        // Try to transfer as stranger (not owner or admin) - should fail
        land_registry::transfer_ownership(&stranger, admin_addr, 1, new_owner);
    }

    #[test(admin = @veridia, owner = @0x123, aptos_framework = @aptos_framework)]
    #[expected_failure(abort_code = 0x30007, location = veridia::land_registry)]
    public entry fun test_frozen_land_transfer(admin: signer, owner: signer, aptos_framework: signer) {
        // Initialize timestamp and registry
        aptos_framework::timestamp::set_time_has_started_for_testing(&aptos_framework);
        land_registry::initialize(&admin);
        
        let admin_addr = signer::address_of(&admin);
        let owner_addr = signer::address_of(&owner);
        let new_owner = @0x456;
        let jurisdiction = string::utf8(b"California, USA");
        let metadata_hash = string::utf8(b"QmHash123456789abcdef");
        
        // Register a land
        land_registry::register_land(&admin, owner_addr, jurisdiction, metadata_hash);
        
        // Freeze the land
        land_registry::update_status(&admin, 1, land_registry::status_frozen());
        
        // Try to transfer frozen land (should fail)
        land_registry::self_transfer_ownership(&owner, admin_addr, 1, new_owner);
    }

    #[test(admin = @veridia, owner = @0x123, aptos_framework = @aptos_framework)]
    public entry fun test_invalidated_status(admin: signer, owner: signer, aptos_framework: signer) {
        // Initialize timestamp and registry
        aptos_framework::timestamp::set_time_has_started_for_testing(&aptos_framework);
        land_registry::initialize(&admin);
        
        let admin_addr = signer::address_of(&admin);
        let owner_addr = signer::address_of(&owner);
        let jurisdiction = string::utf8(b"California, USA");
        let metadata_hash = string::utf8(b"QmHash123456789abcdef");
        
        // Register a land
        land_registry::register_land(&admin, owner_addr, jurisdiction, metadata_hash);
        
        // Test invalidated status
        land_registry::update_status(&admin, 1, land_registry::status_invalidated());
        assert!(land_registry::get_land_status(admin_addr, 1) == land_registry::status_invalidated(), 1);
        
        // Test that invalidated land cannot be transferred
        assert!(!land_registry::can_transfer_land(admin_addr, 1), 2);
    }
}
