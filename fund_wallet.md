# How to Fund Your Wallet for the Veridia App

## The Problem

The application is getting "Not enough APT" errors because your **browser wallet** (Petra/Martian) needs APT, not the CLI account.

## ⚡ Quick Solution - Use CLI to Fund Your Wallet

### Step 1: Get Your Wallet Address

1. Connect your wallet in the app
2. Copy your address from the wallet

### Step 2: Fund via CLI

Run this command with YOUR wallet address:

```bash
aptos account fund-with-faucet --account YOUR_WALLET_ADDRESS --amount 100000000000
```

**Example:**

```bash
aptos account fund-with-faucet --account 0xfdff1c94f22a1af94b1159ddae8d4b1a1450fc220937ecff96ab587030bc2b77 --amount 100000000000
```

**⚠️ Important**: Use `--account` flag, NOT `--address`!

This will give you 100 APT (100,000,000,000 Octas).

## 🔧 Alternative: Use the Default Account

If you want to use the CLI account (which is already funded):

1. Export your default profile's private key
2. Import it into Petra wallet
3. Use that account in the app

Run this to get the private key:

```bash
aptos config show-profiles --profile default
```

Then import that private key into your Petra wallet.

## 📊 Current Funded Account

- **Address**: `0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17`
- **Balance**: ~0.40 APT
- **Status**: Ready to use

## 🎯 Recommended Approach

**Best Solution**: Fund YOUR wallet address directly:

```bash
# Get YOUR wallet address from the app, then:
aptos account fund-with-faucet --account YOUR_ADDRESS --amount 100000000000
```

This is the easiest way to get APT into the wallet you're actually using in the app!
