all:
	./scripts/prepare-deploy.sh

serve:
	python3 -m http.server --directory dist
