prod:
	webpack -p
	cp index.html handboard.html favicon* dist/
dev:
	npm run dev
