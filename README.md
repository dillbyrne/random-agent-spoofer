# Random Agent Spoofer #


RAS is a privacy enhancing firefox addon which aims to hinder browser
fingerprinting. It does this by changing the browser/device profile on a timer.
Each browser profile has been tailored to match the actual values used by the target 
browser as much as possible, within the limits set by firefox.

It also supports other privacy enhancing options


# Features #

- Allows the user to choose a browser profile at random (From all available profiles or desktop profiles only)  

- Allows the user to specify the interval at which the random profiles are
  chosen. Interval can also be random, a specific time period or per session if not set

- Allows the user to exclude profiles from random selection.

- Persistently remembers the users choice of user agent and time interval if set.

- Provides a quick toggle to enable/disable the addon via right clicking the
  icon as well as a checkbox in the UI.

- Provides option to toggle notifications of user agent changes. 

- Allows vendor spoofing that was removed in firefox 24

- Sets other privacy attributes such as buildid, oscpu and platform where the
  values are known.

- It has a left click menu of expandable lists to allow users to quickly choose
  specific profiles

- It has a large list of profiles (nearly 400 at this time).

- Option to limit local dom storage

- Option to disable browser cache

- Option to limit fonts to a standard set (monospace, serif, times new roman)

- Option to limit tab history to two

- Option to disable geolocation support

- Option to disable dns prefetching

- Option to disable link prefetching

- Options to send spoofed headers including  via, x-forwarded-for and if-none-match.
 
- Options to spoof the accept headers: documents, encoding and language (US English) so they match the spoofed profile.

- Option to override timezone offset to a random timezone, send nothing, specify one from a list or use the default one.

- Option to spoof screen and window sizes to a specific size or set at random


# What's Next #

I will continue to update the list of browser profiles. I hope people will submit 
information on their browsers so I can keep the list up to date and correct. I do 
not intend to support every single browser or device. The intention of the addon 
is to help hinder browser fingerprinting by being a moving target..

I will continue to add more features as time goes on.

# Icons #

Icons are modified versions of those of the crystal project.

Licence : https://www.gnu.org/licenses/lgpl-2.1.html


# Donations #

If you would like to donate you can do so at
https://addons.mozilla.org/en-US/firefox/addon/random-agent-spoofer/

