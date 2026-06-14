---
name: "Atomic Ambition (YouTube Automation)"
description: "Automate YouTube channel management: video uploads, metadata, scheduling, and analytics"
status: "yellow"
---

# Atomic Ambition: YouTube Automation Project

## Basic Info
- **Name**: Atomic Ambition
- **Description**: Automate YouTube channel management including video uploads, metadata setting, scheduling, and basic analytics
- **Parent Organization**: Oakbridge Labs (under Nowotny Holding Group)
- **Status**: In Development (as of 2026-06-14)
- **Tech Stack**: Python (for automation scripts), possibly Node.js for integration with The Bridge
- **Goal**: Automate the process of uploading and managing videos on Morty's YouTube channel to support content distribution without manual effort.

## Current State
- No automation currently exists for YouTube channel.
- Manual upload process is time-consuming.
- Need to integrate with The Bridge for logging and monitoring.

## Features

### Must Have (MVP)
- **Video Upload**: Automatically upload video files to YouTube with proper title, description, tags.
- **Metadata Management**: Set video privacy, category, language, and other metadata.
- **Scheduling**: Option to schedule uploads for future dates.
- **Thumbnail Upload**: Ability to set custom thumbnail.
- **Integration with The Bridge**: Upload events logged to The Bridge for monitoring.
- **Error Handling**: Retry mechanisms and notifications on failure.
- **Authentication**: Secure storage and refresh of YouTube API credentials (OAuth 2.0).

### Should Have (V2)
- **Analytics Pull**: Fetch basic analytics (views, watch time) and log to The Bridge.
- **Batch Processing**: Process multiple videos in a queue.
- **Content Optimization**: Suggest titles/tags based on trends (basic).
- **Multi-language Support**: Set default language and translations.

### Nice to Have (Later)
- **Live Streaming Automation**: Schedule and start live streams.
- **Community Engagement**: Auto-respond to comments (with moderation).
- **A/B Testing**: Test different thumbnails/titles.

## Technical Architecture

**Backend:** Python scripts using Google APIs (YouTube Data API v3)
**Authentication:** OAuth 2.0 with token storage (encrypted)
**Integration:** 
- Video files placed in a monitored directory (e.g., ~/youtube-upload-queue/)
- Script processes queue, uploads, logs to The Bridge via HTTP POST to /api/bots/youtube
- The Bridge displays upload status and analytics.

**Infrastructure:** Runs on Morty's Raspberry Pi (same as other bots)
**Deployment:** Systemd service or cron for periodic checking.

## Data Sources

| Data | Source | Integration |
|------|--------|-------------|
| Video files | Local directory (~/youtube-upload-queue/) | Script picks up files |
| Metadata | CSV or JSON accompanying video file | Script reads metadata |
| Upload status | YouTube API response | Log to The Bridge via webhook |
| Analytics | YouTube Analytics API | Periodic pull and log to The Bridge |

## Design / UX (for Morty)
- Simple directory drop: place video + metadata file in queue.
- Metadata file format: JSON with fields: title, description, tags, privacyStatus, scheduleTime (optional), thumbnailPath (optional).
- Script logs success/failure to console and to The Bridge.
- The Bridge shows a YouTube tab with upload history and stats.

## Success Metrics
1. Morty can drop a video file and metadata into the queue and have it uploaded automatically within 5 minutes.
2. Upload status (success/failure) appears in The Bridge in near real-time.
3. Manual upload time reduced from ~15 minutes per video to <2 minutes (drop and forget).
4. Analytics logged to The Bridge weekly.

## Open Questions
- Authentication method: Use service account or OAuth user account? (Recommendation: OAuth user account for Morty's personal channel)
- Metadata format: JSON or CSV? (Recommendation: JSON per video file)
- Where to store credentials securely? (Recommendation: encrypted file in ~/.config/youtube-authn/)
- How to handle large video files? (Chunked upload via YouTube API)
- Should we integrate with existing script runners (like Rick) or run as standalone? (Recommendation: standalone Python script managed by systemd)

## Timeline
- **Phase 0 (Now):** Build youtube-publisher skill (this skill) — enables Morty to run the upload script.
- **Phase 1 (1-2 days):** Create the upload script, test with dummy video.
- **Phase 2 (2-4 days):** Integrate with The Bridge, add metadata handling, scheduling.
- **Phase 3 (1 week):** Add analytics pull, error handling, documentation.
- **Phase 4 (Ongoing):** Monitor, improve, add features.

## Dependencies
- Google APIs client library for Python
- google-auth-oauthlib for OAuth flow
- Systemd or cron for scheduling

## First Steps for Morty
1. Build the youtube-publisher skill (see below).
2. Set up OAuth credentials for YouTube API.
3. Create the upload script and test.
4. Configure The Bridge endpoint to receive upload logs.

## Skills Morty Must Build
To support the Atomic Ambition project, Morty must build the following skill:

### youtube-publisher
A skill that enables Morty to automate YouTube video uploads and management. This skill includes:
- A script or command that can upload a video file to YouTube given metadata (title, description, tags, etc.)
- Integration with The Bridge to log upload events and optionally pull analytics.
- Secure handling of YouTube API credentials (OAuth 2.0).
- Ability to process a queue of videos (e.g., monitor a directory for new video+metadata pairs).
- Logging and error handling suitable for long-running automation.

Once this skill is built, Morty can use it to upload videos automatically, fulfilling the core automation goal of Atomic Ambition.

