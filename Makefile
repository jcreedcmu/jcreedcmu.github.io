all:
	./node_modules/.bin/ts-node src/make.ts

serve:
	python3 -m http.server
