# Random Agent Spoofer ![RAS icon](https://github.com/dillbyrne/random-agent-spoofer/blob/master/data/images/icon.png "RAS icon")

RAS is a privacy enhancing firefox addon which aims to hinder browser fingerprinting. It does this by changing the browser/device profile on a timer. Each browser profile has been tailored to match the actual values used by the target browser as much as possible, within the limits set by firefox.

It also supports other privacy enhancing options.

This document was last updated for 0.9.5.2 release.

![Ras Profile Tab 0.9.5.2](https://cloud.githubusercontent.com/assets/2903711/7324733/e0aa7140-eab0-11e4-889d-d1ceb7da9a0f.png "Ras Profile Tab 0.9.5.2")

## Features

### Profile

- Allows the user to choose a specific browser profile or one at random (from all available profiles, desktop, mobile or by OS family).
- Allows the user to specify the interval at which the random profiles are chosen. Interval can also be random (1-60 minutes), a specific time period or per session if the timer is not set.
- Allows the user to exclude profiles from random selection.
- Persistently remembers the users choice of profile and time interval if set.
- Profile notifications can be toggled in the addons preferences (see about:addons).
- Allows vendor spoofing that was removed in firefox 24.
- Sets other privacy attributes such as buildid, oscpu and platform.
- It has a left click menu of expandable lists to allow users to quickly choose specific profiles and options.
- It has a large list of profiles ( 321 at this time).

### Headers

- Options to send spoofed headers including via and x-forwarded-for headers with a random or custom ip.
- Option to send spoofed if-none-match headers.
- Option to disable sending of authorization headers.
- Option to send do not track headers.
- Option to block or allow referer headers (there is an issue open to build upon this).
- Options to send spoofed accept headers that are tailored to the currently selected profile. (there is an issue open to add more options for the language header).

### Options

- Option to toggle RAS script injection (it is required for certain options and for the whitelist).
- Option to spoof the date and time strings to a random one or a specific one. (An issue is open to improve this).
- Option to spoof screen and window sizes to a specific size or random or a random tailored size defined in the profile.
- Option to protect window.name.
- Option to disable canvas support.
- Option to limit tab history to 2.
- Option to use document fonts.
- Option to disable local dom storage.
- Option to disable browsing and download history.
- Option to disable memory cache.
- Option to disable disk cache.
- Option to disable network cache (forced by default to fix issue #121 looking for a work around).
- Option to disable geolocation.
- Option to disable link prefetching.
- Option to disable dns prefetching.
- Option to disable webgl.
- Option to disable webrtc.
- Option to disable pdfjs.
- Option to disable search suggestions.
- Option to disable navigation timing.
- Option to disable battery api.
- Option to disable gamepad api.
- Option to use click to play for plugins.
- Option to block active mixed content.
- Option to block display mixed content.
- Option to disable browser pings.
- Option to disable clipboard events.
- Option to disable context menu events.
- Option to enable tracking protection (which uses disconnect's blocklist).
- Option to disable plugin name enumeration.
- Option to disable css visited links.

### Whitelist

- Option to toggle whitelist support.
- Option to set a custom whitelist profile.
- Option to write and edit whitelist rules.

### Context Menu Options

- The context menu entry can be toggled on or off in the addon preferences (see about:addons).
- Option to select the real profile or any random profile option.
- Option to set the random profile timer.
- Option to allow users to use temporary email services for one time signups when invoked on an input box (6 services currently available).

## Wiki

Please see the [wiki](https://github.com/dillbyrne/random-agent-spoofer/wiki) for installation instructions, a user guide and ideas for contributing.

## Icons

Most of the icons used are from the  Unique-Round-Blue icon set by [Unique Design 10](http://www.uniquedesign10.com/). Some of these have been modified for RAS.

Licence: Free for commercial use (Include link to authors website).

The timer icon used is blue clock icon by [Double J Design](http://www.doublejdesign.co.uk/), it has been slightly modified.

Licence: Creative Commons (Attribution 3.0 Unported).

## Donations

If you would like to donate, you can do so at the
[RAS mozilla addons page](https://addons.mozilla.org/en-US/firefox/addon/random-agent-spoofer/) or with bitcoin at *1L44pgmZpeMsWsd24WgN6SJjEUARG5eY6G* or with flattr

[
![Flattr this](https://button.flattr.com/flattr-badge-large.png)
](https://flattr.com/submit/auto?user_id=dillbyrne&url=https%3A%2F%2Fgithub.com%2Fdillbyrne%2Frandom-agent-spoofer)
