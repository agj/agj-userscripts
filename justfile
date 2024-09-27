# List available tasks.
default:
	just --list

# Load a shell with all dependencies (if you don't use direnv).
init:
	@echo "You may type 'exit' to return to the regular shell.\n"
	nix develop -c "$$SHELL"

# Compile (and format) all TS files into JS.
build:
	tsc
	just format

# Continually compile and format when changes are made.
watch:
	find . -path '**/*.js' -or -path '**/*.ts' \
		| entr just build

# Format files.
format:
	prettier --write '**/*.(ts|js)'
