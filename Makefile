PRODUCT ?= xverse
HORIZONX_ROOT ?= /opt/horizonx

.PHONY: dev dev-down deploy-staging deploy-production rollback-staging rollback-production staging-logs prod-logs

# --- Local development ------------------------------------------------------
dev:
	docker compose -f docker-compose.dev.yml up --build

dev-down:
	docker compose -f docker-compose.dev.yml down

# --- VPS deploy/rollback — run these FROM the VPS, once the shared
# HorizonX deploy toolkit is installed at $(HORIZONX_ROOT)/shared/deploy
# (see DEPLOYMENT.md). TAG is required for deploy, optional for rollback
# (defaults to the previous tag). Override PRODUCT= for a different product.
deploy-staging:
	$(HORIZONX_ROOT)/shared/deploy/deploy.sh --product $(PRODUCT) --environment staging --tag $(TAG)

deploy-production:
	$(HORIZONX_ROOT)/shared/deploy/deploy.sh --product $(PRODUCT) --environment production --tag $(TAG)

rollback-staging:
	$(HORIZONX_ROOT)/shared/deploy/rollback.sh --product $(PRODUCT) --environment staging $(if $(TAG),--tag $(TAG))

rollback-production:
	$(HORIZONX_ROOT)/shared/deploy/rollback.sh --product $(PRODUCT) --environment production $(if $(TAG),--tag $(TAG))

# --- Local inspection of this repo's own compose files (not the VPS's
# renamed copies) — requires .env.staging/.env.production to exist locally
# (copied from the .example templates), useful for testing before onboarding.
staging-logs:
	docker compose -f docker-compose.staging.yml --env-file .env.staging logs -f

prod-logs:
	docker compose -f docker-compose.prod.yml --env-file .env.production logs -f
