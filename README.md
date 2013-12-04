# Random Agent Spoofer #


RAS is a firefox addon which allows the use of various user agents, which it can
automatically switch to at random after a chosen period of time has expired.


# Features #

- Allows the user to choose a random user agent (From all user agents or desktop only)  

- Allows the user to specify the interval at which the random agent changes.
  Interval can also be random

- Persistently remembers the users choice of user agent and time interval if set.

- Provides a quick toggle to enable/disable the addon via right clicking the
  icon.

- Provides option to toggle notifications of user agent changes. 

- Sets other privacy attributes such as buildid, oscpu and platform where the
  values are known.

- It has a left click menu of expandable lists to allow users to quickly choose
  specific user agents

- It has a large list of user agents.


# What's Next #

I will continue to update the list of useragents and their related properties. 
I hope people will submit information on their browsers so I can keep the list 
up to date and correct. I do not intend to support every single useragent or 
device. The intention of the addon is to help hinder browser fingerprinting.

# Icons #

Icons are modified versions of those of the crystal project.

Licence : https://www.gnu.org/licenses/lgpl-2.1.html

# Note #

Note although this app sets appvendor and other attributes. Mozilla has removed
the ability from ff25

According to a response from the Mozilla forums

This is scheduled to be fixed in Firefox 28, per Bug #939445 –
"general.appname.override" pref is ignored (Firefox 25 regression). It's not yet
clear whether the change will be escalated into Firefox 26, but you can vote for
the bug to try to increase the urgency.

Please file any bug reports here on github
