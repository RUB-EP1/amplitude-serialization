PYTHON ?= python3
PORT ?= 8000

.PHONY: display test-explorer

display: ## Open the standalone model explorer without building the notebooks
	$(PYTHON) docs/explorer/manage.py --serve --open --port $(PORT)

test-explorer: ## Check model navigation and references (Node.js 18+)
	node --test docs/explorer/model.test.mjs
	$(PYTHON) -m unittest discover -s docs/explorer -p 'test_*.py'
