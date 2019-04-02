#!/usr/bin/make -f

%:
	./makexpi.sh
	
prerelease: pkg
	./makexpi.sh

pkg:
	mkdir pkg

clean:
	rm -rf pkg

.PHONY: clean prerelease
