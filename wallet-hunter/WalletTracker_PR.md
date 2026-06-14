# WalletTracker Product Requirements Document

## Basic Info
- **Name**: WalletTracker
- **Description**: Blockchain transaction tracing add-on for WalletHunter that follows whale transactions to their final destination
- **Parent Organization**: Oakbridge Labs (under Nowotny Holding Group)
- **Status**: Proposed
- **Tech Stack**: Python, blockchain explorers/APIs (Etherscan, Blockchair, etc.), potentially graph databases for tracing
- **Goals**: 
  - Provide deeper insight into whale movements beyond simple alerts
  - Help users understand the intent behind large transactions (e.g., exchange deposits vs. wallet accumulation)
  - Increase WalletHunter value proposition to justify higher tiers
  - Target: Available in $25/$35 tiers (not in $15 basic tier)
- **Ownership**: Craig Nowotny / Oakbridge Labs

## Sources
- Derived from WalletHunter whale alert system
- Inspired by blockchain forensics and transaction tracing tools

## Current State
- WalletHunter exists as a live Telegram-based whale alert service for Polymarket, Kalshi, and crypto prediction markets
- Basic transaction detection and alerting is functional
- No tracing capability currently implemented

## Proposed Features
1. **Automatic Tracing Trigger**: When WalletHunter detects a whale transaction (based on configurable thresholds), WalletTracker automatically initiates a trace
2. **Multi-Hop Analysis**: Follows funds through multiple wallet hops to identify ultimate destination
3. **Entity Labeling**: Attempts to identify known entities (exchanges, DeFi protocols, whales) using address labeling databases
4. **Destination Classification**: Categorizes final destination as: Exchange, DeFi Protocol, Wallet (unknown), Mixer, Contract, etc.
5. **Visual Flow Diagram**: Optional graphical representation of transaction flow (could be hosted on website or sent as image)
6. **Trace Confidence Score**: Indicates reliability of trace based on hop count, labeling certainty, etc.
7. **Configurable Trace Depth**: Users can set how many hops to follow (default 5 hops)
8. **Exclude Known Mixers**: Option to stop tracing when mixer addresses are encountered (for privacy compliance)
9. **Integration with Alerts**: Enhanced whale alerts include tracing results (e.g., "Whale moved 1000 ETH to Binance deposit address")
10. **Historical Trace Lookup**: Ability to trace past transactions (if hash is known)

## User Stories
- As a WalletHunter user, I want to know not just that a whale moved funds, but where those funds ended up, so I can better infer market intent.
- As a trader, I want to see if whale deposits to exchanges suggest impending sell pressure.
- As a researcher, I want to trace illicit funds or track known whale wallets over time.
- As a subscriber, I want higher-tier features that provide actionable intelligence beyond basic alerts.

## Technical Approach
1. **Trigger**: WalletHunter's alert system (which monitors blockchain for large transactions) will call WalletTracker's tracing function when a whale transaction is detected.
2. **Tracing Engine**: 
   - For each transaction, retrieve details from blockchain (via node RPC or explorer API)
   - Identify all output addresses and amounts
   - For each significant output (above dust threshold), recursively trace subsequent transactions
   - Avoid infinite loops by tracking visited addresses and transactions
   - Stop at max depth or when address is labeled as exchange/dead end
3. **Data Sources**:
   - Blockchain APIs: Etherscan, Blockchair, Blockcypher, or direct RPC nodes (infrastructure dependent)
   - Address labeling: Combine multiple sources (exchange hot/cold wallet lists, known DeFi protocols, etc.)
   - Optional: Graph database (Neo4j) for complex traversal and pattern detection
4. **Output**: 
   - Text summary: "Traced 5 hops: Whale Wallet -> Uniswap V3 Router -> Unknown Wallet -> Binance Deposit"
   - Optional: Mermaid.js diagram or PNG image showing flow
   - Metadata: Total value traced, number of hops, final destination label, confidence score
5. **Integration**: 
   - Enhance existing JSON payload sent to Supabase with tracing results
   - Telegram bot message formatting to include trace summary
   - Website dashboard to show detailed traces

## Immediate Next Steps (if approved)
1. Research and select blockchain tracing APIs/libraries
2. Design tracing algorithm (breadth-first or depth-first with limits)
3. Create prototype for Ethereum (since most whale activity is on ETH)
4. Integrate with WalletHunter's alert trigger mechanism
5. Design UI/output format for Telegram and web
6. Test with known whale transactions
7. Plan rollout to higher subscription tiers

## Dependencies
- WalletHunter's whale detection system must be functional and reliable
- Access to blockchain data (API keys or node infrastructure)
- Address labeling data (may require partnerships or purchases)

## Potential Challenges
- **Scalability**: Tracing can be computationally intensive; need to limit depth and concurrency
- **Accuracy**: Labeling addresses correctly is challenging; may require heuristics
- **Privacy**: Tracing may raise concerns; ensure compliance with regulations (not tracking individuals without consent)
- **Cost**: Blockchain API calls can be expensive at scale
- **False Positives**: Mistaken identity of addresses

## Success Metrics
- Percentage of whale alerts that include tracing results (target: 80%+)
- User engagement with tracing feature (click-through on detailed traces)
- Upgrade rate from basic to higher tiers due to WalletTracker
- User feedback on usefulness of tracing for trading decisions

## Open Questions
- Should tracing be opt-in or automatic for subscribed tiers?
- How many hops should be traced by default?
- Should we trace incoming transactions as well (to see where funds came from)?
- How to handle cross-chain transactions (if multi-chain support needed)?
- What level of detail to show in Telegram messages vs. web dashboard?

---
*This PRD outlines the proposed WalletTracker feature for WalletHunter. Feedback and iteration needed before development begins.*