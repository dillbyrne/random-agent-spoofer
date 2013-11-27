# random-agent-spoofer #

====================

Firefox addon - Allows the use of various user agents, which it can
automatically switch to at random after a chosen period of time has expired.

===================

# Features #

Allows the user to choose a random user agent

Allows the user to specify the interval at which the random agent changes.
Interval can also be random

Persistently remembers the users choice of user agent and time interval if set.

Provides a quick toggle to enable/disable the addon via right clicking the icon

Sets other privacy attributes such as buildid, oscpu and platform where the
values are known. I hope people will submit information on their browsers so I
can keep the list up to date and correct.

It has a left click menu of expandable lists to allow users to quickly choose
specific user agents

Has supports for a lot of user agents


# What's Next #

I will continue to update the list of useragents and their related properties. I
do not intend to support every single useragent or device. The intention of the
app is to help hinder browser fingerprinting


# Note #

Note although this app sets appvendor and other attributes. Mozilla has removed
the ability from ff25

According to a response from the Mozilla forums

This is scheduled to be fixed in Firefox 28, per Bug #939445 –
"general.appname.override" pref is ignored (Firefox 25 regression). It's not yet
clear whether the change will be escalated into Firefox 26, but you can vote for
the bug to try to increase the urgency.

Please file any bug reports here on github
