
VERSION=v0.0.6

push:
	gcloud builds submit --tag asia-southeast1-docker.pkg.dev/learn-441406/ecom-front/ecom-front:$(VERSION) .


VERSION = 1.0.2
COMMIT_SHA ?= $(shell git rev-parse --short HEAD)
REGISTRY = ghcr.io/hydr0g3nz
IMAGE_NAME = poc_pos_ant
# Manual version build
version:
	@echo "Current version: $(VERSION)"

# Build and push with specified or default version
build_push:
	@echo "Building and pushing image with version: $(VERSION)"
	docker build -t $(REGISTRY)/$(IMAGE_NAME):$(VERSION) .
	docker push $(REGISTRY)/$(IMAGE_NAME):$(VERSION)

# Build and push with commit SHA
build_push_sha:
	@echo "Building and pushing image with commit SHA: $(COMMIT_SHA)"
	docker build -t $(REGISTRY)/$(IMAGE_NAME):$(COMMIT_SHA) .
	docker push $(REGISTRY)/$(IMAGE_NAME):$(COMMIT_SHA)

# Alias for CI/CD process
cicd: build_push_sha