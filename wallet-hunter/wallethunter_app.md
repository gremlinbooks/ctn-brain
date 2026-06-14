# Wallethunter App Project Document

## Basic Info
- **Name**: Wallethunter
- **Description**: SaaS — whale tracking / smart money analytics for prediction markets
- **Parent Organization**: Oakbridge Labs (under Nowotny Holding Group)
- **Status**: LIVE but CRITICAL — website up (thewallethunter.com), Stripe live, Telegram bot active, 0 paid subscribers. Content created but not posted
- **Tech Stack**: Heroku, Supabase, Stripe, Telegram, Python (alert poller, Kalshi tracker, multi-chain tracker), Polymarket + Kalshi APIs
- **Goals**: 
  - 100 subscribers by May 11 (missed)
  - $7M exit target at 5-7x $1M ARR (1,500 subs at ~$56 ARPU)
  - Tiers: $15/$25/$35/month
- **Ownership**: Craig Nowotny / Oakbridge Labs

## Sources
- From Claude Code Workspace Research Report

## Current State
- Website live at thewallethunter.com
- Stripe integration live (payments enabled)
- Telegram bot active
- Currently 0 paid subscribers (CRITICAL)
- Content created but not posted (50 TikTok scripts, 20 Twitter threads, 89 Canva signals ready)
- Using Python for alert polling, Kalshi tracking, multi-chain tracking
- Integrated with Polymarket and Kalshi APIs
- Hosted on Heroku with Supabase backend
- **Critical Issues**:
  - Zero paid subscribers
  - Mobile UI broken (overlapping text)
  - Heroku config throttling alerts (PAID_FEED_ONLY=true, thresholds too high)
  - Content ready but not posted

## Immediate Fixes Needed
1. Set WHALE_THRESHOLD=25000 (instead of current high threshold)
2. Set PAID_FEED_ONLY=false
3. Fix mobile CSS to resolve overlapping text
4. Post queued content (50 TikTok scripts, 20 Twitter threads, 89 Canva signals)

## Roadmap
1. Implement immediate fixes above
2. Post existing content to attract initial users
3. Implement user onboarding and conversion flow
4. Drive to achieve 100 subscribers (missed May 11 target)
5. Refine pricing and tiers based on user feedback
6. Scale toward 1,500 subscribers for $1M ARR
7. Optimize for $7M exit target at 5-7x revenue multiple
8. Continue adding features and analytics
9. Build community and user engagement
10. Explore partnerships or integrations with other platforms
11. Prepare for exit or continued growth

## Development Plan to Complete
### Delta Analysis
- **Current State**: Live infrastructure but 0 paid subscribers; content ready but not posted; critical config/UI issues
- **Target State**: 1,500 paying subscribers generating $1M ARR for $7M exit target
- **Gap**: User acquisition, content posting, conversion optimization, scaling, plus immediate technical fixes

### Next Steps
1. **Immediate Technical Fixes** (Do First):
   - Update Heroku config: WHALE_THRESHOLD=25000, PAID_FEED_ONLY=false
   - Fix mobile CSS overlapping text issue
   - Post all queued content (50 TikTok scripts, 20 Twitter threads, 89 Canva signals)
2. **User Acquisition & Conversion**:
   - Implement email capture and nurture sequences
   - Launch marketing campaign to attract initial users
   - Optimize landing page and signup flow for conversion
   - Engage with early users for feedback and testimonials
   - Implement referral program or affiliate incentives
3. **Growth & Optimization**:
   - Monitor metrics: CAC, LTV, churn, conversion rates
   - Iterate on pricing and feature tiers based on user feedback
   - Scale successful acquisition channels
   - Consider paid acquisition if organic growth insufficient
4. **Long-term**:
   - Continue adding features and analytics
   - Build community and user engagement
   - Explore partnerships or integrations with other platforms
   - Prepare for exit or continued growth

### Blockers
- **Primary**: Zero paid subscribers despite live infrastructure
- **Secondary**: Technical issues blocking user experience (mobile UI, config throttling)
- **Tertiary**: Content ready but not posted - missing marketing/user acquisition
- **Quaternary**: Need to achieve product-market fit and clear value proposition
- **Quinary**: Competition in prediction market analytics space

## Additional Notes
- WalletHunter is described as "LIVE but CRITICAL" indicating urgency
- The missed May 11 target for 100 subscribers suggests user acquisition is challenging
- Clear financial targets: $7M exit at 5-7x $1M ARR (1,500 subscribers at ~$56 ARPU)
- Tiered pricing: $15/$25/$35/month suggests different feature levels
- As a whale tracking/smart money analytics tool, it could complement the Polymarket trading bot (Njord) by providing market intelligence
- The connection to Oakbridge Labs suggests it's part of the broader ecosystem that includes Lineal, trading bots, and consulting