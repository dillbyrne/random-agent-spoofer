#!/bin/bash
# Note: Version needs to be changed here to set it in pacakage.json, and in install.rdf for a release build. The .ignore file contains which files will not be added to xpi.
VERSION="0.9.5.8.4"
sed -i "/<em:version>/c\          <em:version>$VERSION</em:version>" install.rdf
sed -i "/version\x22:/c\\\x9\x22version\x22: \x22$VERSION\x22," package.json
if [ ! -d "$DIRECTORY" ]; then
	mkdir pkg
fi
cd pkg
7z a -tzip -mx9 -mm=Deflate -mfb=258 -mmt=8 -mpass=15 -mtc=on "random_agent_spoofer-$VERSION-fx.xpi.zip" ../* -x@../.ignore
cd ..
echo "Generated "random_agent_spoofer-$VERSION-fx.xpi.zip" placed in pkg/"
sha512sum pkg/*
echo "Done!"
