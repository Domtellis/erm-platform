SHELL := /bin/bash
ROOT := $(shell pwd)
PYTHON ?= python3
VENV ?= .venv
PIP := $(VENV)/bin/pip
PY := $(VENV)/bin/python

# Node tools pinned for reproducibility (works without package.json)
MARKDOWNLINT := npx --yes markdownlint-cli2@0.14.0

.PHONY: help install venv validate schemas md-lint links-internal generate-index check-index lint ci

help:
	@echo "Targets:"
	@echo "  make install         - create venv and install dev deps"
	@echo "  make schemas         - validate YAML files against JSON Schemas"
	@echo "  make md-lint         - lint markdown"
	@echo "  make links-internal  - check internal (relative) markdown links"
	@echo "  make generate-index  - regenerate content/enterprise-architecture/03-experience/README.md"
	@echo "  make check-index     - fail if README.md is out of date"
	@echo "  make lint            - run schemas + md-lint + links-internal + check-index"
	@echo "  make ci              - same as lint (CI entrypoint)"

venv:
	@test -d $(VENV) || $(PYTHON) -m venv $(VENV)
	@$(PIP) -q install --upgrade pip

install: venv
	@$(PIP) -q install -r tools/requirements-dev.txt

schemas: install
	@$(PY) tools/validate_yaml_schema.py

md-lint:
	@$(MARKDOWNLINT) "**/*.md"

links-internal: install
	@$(PY) tools/check_internal_links.py

generate-index: install
	@$(PY) tools/generate_experience_architecture_readme.py

check-index: generate-index
	@git diff --exit-code content/enterprise-architecture/03-experience/README.md

lint: schemas md-lint links-internal check-index

ci: lint
