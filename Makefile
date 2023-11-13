all:
	./scripts/prepare-deploy.sh

serve:
	./node_modules/.bin/ts-node src/serve.ts
