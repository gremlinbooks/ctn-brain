# Operation Bulldozer Project Document

## Basic Info
- **Name**: Operation Bulldozer
- **Description**: Trading integration — Polymarket singles + DraftKings parlay stacking
- **Parent Organization**: Likely Oakbridge Labs or personal project
- **Status**: Spec complete (BULLDOZER.md), build planned for weekend May 16-17, soft launch May 18 with $50 seed
- **Tech Stack**: WalletHunter Supabase signals → Python scoring engine → Polymarket bot + manual DK parlay
- **Goals**: 
  - $50-100/day net profit via parlay multiplier by week 4
  - Bulldoze debt with swept profits
- **Ownership**: Craig Nowotny. Rick (agent) as strategic advisor
- **Scoring**: 
  - Cross-platform divergence (Poly vs Kalshi) 30%
  - Smart-money consensus 25%
  - Liquidity 20%
  - Implied prob 60-85% 15%
  - Time-to-resolution 10%
- **Discipline rules (locked)**: 
  - $500 account cap
  - 25% daily position limit
  - Weekly sweeps to debt reserve
  - No averaging down
- **Key Risk**: Craig's ENTP/7w8 personality → "discipline in CODE, not vibes"

## Sources
- From Claude Code Workspace Research Report

## Current State
- Specification complete (BULLDOZER.md)
- Build planned for weekend May 16-17
- Soft launch planned for May 18 with $50 seed
- Integrates WalletHunter signals, Python scoring engine, Polymarket bot, and manual DraftKings parlays
- Uses disciplined scoring system with specific weightings
- Has strict risk management rules in place

## Roadmap
1. Complete build over weekend May 16-17
2. Soft launch May 18 with $50 seed
3. Monitor performance and adjust as needed
4. Scale toward $50-100/day net profit by week 4
5. Sweep profits to debt reserve weekly
6. Optimize scoring engine and strategy
7. Consider automation of DraftKings parlay component
8. Explore expansion to other betting platforms or strategies

## Development Plan to Complete
### Delta Analysis
- **Current State**: Spec complete, ready to build
- **Target State**: Profitable trading operation generating $50-100/day net profit
- **Gap**: Build, launch, initial testing, optimization to profitability

### Next Steps
1. Build the system over weekend May 16-17 per spec
2. Set up WalletHunter Supabase signals integration
3. Implement Python scoring engine with defined weightings
4. Connect to Polymarket bot for single bets
5. Set up manual DraftKings parlay component (initially)
6. Launch soft launch May 18 with $50 seed
7. Monitor daily performance and key metrics
8. Ensure discipline rules are followed ($500 cap, 25% daily limit, weekly sweeps)
9. Analyze performance and optimize scoring weights if needed
10. Sweep weekly profits to debt reserve
10. Reach $50-100/day net profit by week 4
11. Consider automating DraftKings parlay component
12. Document lessons learned and strategy effectiveness

### Blockers
- **Primary**: Build completion (weekend May 16-17)
- **Secondary**: Soft launch and initial performance (May 18+)
- **Tertiary**: Maintaining discipline per spec (especially given ENTP/7w8 personality risk)
- **Quaternary**: Achieving $50-100/day net profit target by week 4
- **Quinary**: Manual DraftKings parlay component may limit scalability

## Additional Notes
- Operation Bulldozer represents an innovative trading strategy combining prediction markets (Polymarket) with sports betting (DraftKings parlays)
- The discipline rules are critical: $500 account cap, 25% daily position limit, weekly sweeps to debt reserve, no averaging down
- The key risk noted is Craig's personality type (ENTP/7w8) potentially undermining discipline - hence "discipline in CODE, not vibes"
- This strategy aims to generate profits to pay down debt through swept profits
- Integration with WalletHunter suggests it will use smart money analytics to inform trading decisions
- The scoring system combines multiple factors: cross-platform divergence, smart-money consensus, liquidity, implied probability, and time-to-resolution