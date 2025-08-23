#!/bin/bash

# Veridia Land Registry - Metadata Retrieval Script
# Usage: ./get_land_metadata.sh 1
# Usage: ./get_land_metadata.sh 1 --detailed

LAND_ID=$1
DETAILED=$2
REGISTRY_ADDR="0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17"

if [ -z "$LAND_ID" ]; then
    echo "❌ Usage: $0 <land_id> [--detailed]"
    echo "   Example: $0 1"
    echo "   Example: $0 1 --detailed"
    exit 1
fi

echo "🏗️  Veridia Land Registry - Metadata Retrieval"
echo "📍 Land ID: $LAND_ID"
echo ""

# Check if land exists first
echo "🔍 Checking if land exists..."
EXISTS_RESULT=$(aptos move view --function-id "$REGISTRY_ADDR::land_registry::land_exists" --args "address:$REGISTRY_ADDR" "u64:$LAND_ID")
EXISTS=$(echo $EXISTS_RESULT | jq -r '.Result[0]')

if [ "$EXISTS" != "true" ]; then
    echo "❌ Land ID $LAND_ID does not exist!"
    exit 1
fi

echo "✅ Land exists! Retrieving metadata..."
echo ""

if [ "$DETAILED" = "--detailed" ]; then
    # Get complete land information
    echo "📋 Complete Land Information:"
    LAND_INFO=$(aptos move view --function-id "$REGISTRY_ADDR::land_registry::get_land_info" --args "address:$REGISTRY_ADDR" "u64:$LAND_ID")
    
    ID=$(echo $LAND_INFO | jq -r '.Result[0]')
    OWNER=$(echo $LAND_INFO | jq -r '.Result[1]')
    JURISDICTION=$(echo $LAND_INFO | jq -r '.Result[2]')
    METADATA_HASH=$(echo $LAND_INFO | jq -r '.Result[3]')
    STATUS=$(echo $LAND_INFO | jq -r '.Result[4]')
    REGISTERED_AT=$(echo $LAND_INFO | jq -r '.Result[5]')
    
    case $STATUS in
        "0") STATUS_TEXT="Active" ;;
        "1") STATUS_TEXT="Frozen" ;;
        "2") STATUS_TEXT="Disputed" ;;
        "3") STATUS_TEXT="Invalidated" ;;
        *) STATUS_TEXT="Unknown" ;;
    esac
    
    # Convert timestamp to readable date (divide by 1000000 to get seconds)
    TIMESTAMP_SECONDS=$((REGISTERED_AT / 1000000))
    READABLE_DATE=$(date -d "@$TIMESTAMP_SECONDS" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -r $TIMESTAMP_SECONDS '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "Invalid date")
    
    echo "  🆔 Land ID: $ID"
    echo "  👤 Owner: $OWNER"
    echo "  📍 Jurisdiction: $JURISDICTION"
    echo "  🔗 Metadata Hash: $METADATA_HASH"
    echo "  📊 Status: $STATUS_TEXT ($STATUS)"
    echo "  📅 Registered: $READABLE_DATE"
    echo ""
    
    # Additional checks
    echo "🔧 Additional Information:"
    
    # Check if land can be transferred
    CAN_TRANSFER_RESULT=$(aptos move view --function-id "$REGISTRY_ADDR::land_registry::can_transfer_land" --args "address:$REGISTRY_ADDR" "u64:$LAND_ID")
    CAN_TRANSFER=$(echo $CAN_TRANSFER_RESULT | jq -r '.Result[0]')
    
    if [ "$CAN_TRANSFER" = "true" ]; then
        echo "  🔄 Can Transfer: ✅ Yes"
    else
        echo "  🔄 Can Transfer: ❌ No"
    fi
    
else
    # Quick metadata retrieval
    echo "🗺️  Jurisdiction (Location):"
    JURISDICTION_RESULT=$(aptos move view --function-id "$REGISTRY_ADDR::land_registry::get_land_jurisdiction" --args "address:$REGISTRY_ADDR" "u64:$LAND_ID")
    JURISDICTION=$(echo $JURISDICTION_RESULT | jq -r '.Result[0]')
    echo "  📍 $JURISDICTION"
    echo ""
    
    echo "🔗 Metadata Hash (IPFS/Arweave):"
    METADATA_RESULT=$(aptos move view --function-id "$REGISTRY_ADDR::land_registry::get_land_metadata_hash" --args "address:$REGISTRY_ADDR" "u64:$LAND_ID")
    METADATA_HASH=$(echo $METADATA_RESULT | jq -r '.Result[0]')
    echo "  🔗 $METADATA_HASH"
    echo ""
    
    echo "👤 Owner:"
    OWNER_RESULT=$(aptos move view --function-id "$REGISTRY_ADDR::land_registry::get_land_owner" --args "address:$REGISTRY_ADDR" "u64:$LAND_ID")
    OWNER=$(echo $OWNER_RESULT | jq -r '.Result[0]')
    echo "  👤 $OWNER"
    echo ""
    
    echo "📊 Status:"
    STATUS_RESULT=$(aptos move view --function-id "$REGISTRY_ADDR::land_registry::get_land_status" --args "address:$REGISTRY_ADDR" "u64:$LAND_ID")
    STATUS=$(echo $STATUS_RESULT | jq -r '.Result[0]')
    
    case $STATUS in
        "0") STATUS_TEXT="Active" ;;
        "1") STATUS_TEXT="Frozen" ;;
        "2") STATUS_TEXT="Disputed" ;;
        "3") STATUS_TEXT="Invalidated" ;;
        *) STATUS_TEXT="Unknown" ;;
    esac
    
    echo "  📊 $STATUS_TEXT ($STATUS)"
fi

echo ""
echo "💡 Use --detailed flag for complete information"
echo "🌐 Access full documents using the metadata hash on IPFS/Arweave"
