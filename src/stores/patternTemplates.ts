import { readable } from 'svelte/store';

const patternTemplates = [
	{ name: "Oseberg", hash: "MTA6MTk6MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDp8MSM4ZjU5MDIjOGY1OTAyIzhmNTkwMiM4ZjU5MDJ8MCNjMTdkMTEjYzE3ZDExI2MxN2QxMSNjMTdkMTF8MCNmZmZmYjcjZmZmZmI3I2ZmZmZiNyNmZmZmYjd8MSNjYzAwMDAjZmZmZmI3I2NjMDAwMCNjYzAwMDB8MSNmZmZmYjcjY2MwMDAwI2ZmZmZiNyNjYzAwMDB8MSNjYzAwMDAjZmZmZmI3I2NjMDAwMCNmZmZmYjd8MSNjYzAwMDAjY2MwMDAwI2ZmZmZiNyNjYzAwMDB8MCNmZmZmYjcjZmZmZmI3I2ZmZmZiNyNmZmZmYjd8MCNjMTdkMTEjYzE3ZDExI2MxN2QxMSNjMTdkMTF8MSM4ZjU5MDIjOGY1OTAyIzhmNTkwMiM4ZjU5MDI=" },
	{ name: "Widderhorn", hash: "MTQ6MTk6MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTExMDAxMTEwMDAwMDAxMTEwMDExMTAwMDAwMDExMTAwMTExMDAwMDAwMTExMDAxMTEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDExMTAwMTExMDAwMDAwMTExMDAxMTEwMDAwMDAxMTEwMDExMTAwMDAwMDExMTAwMTExMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA6fDEjMmUzNDM2IzJlMzQzNiMyZTM0MzYjMmUzNDM2fDAjMmUzNDM2IzJlMzQzNiMyZTM0MzYjMmUzNDM2fDEjZTBmOGZmI2UwZjhmZiNlMGY4ZmYjZTBmOGZmfDAjZTBmOGZmI2UwZjhmZiNmMGZjZmYjMmUzNDM2fDAjZjBmY2ZmI2YwZmNmZiMyZTM0MzYjMzQ2NWE0fDAjZmZmZmZmIzJlMzQzNiMzNDY1YTQjMmUzNDM2fDAjMmUzNDM2IzM0NjVhNCMyZTM0MzYjZmZmZmZmfDAjMzQ2NWE0IzJlMzQzNiNmZmZmZmYjMmUzNDM2fDEjMzQ2NWE0IzJlMzQzNiNmZmZmZmYjMmUzNDM2fDEjMjA0YTg3IzM0NjVhNCMyZTM0MzYjZmZmZmZmfDEjMjMxZDYyIzIwNGE4NyMyMDRhODcjMmUzNDM2fDEjMjMxZDYyIzIzMWQ2MiMyMzFkNjIjMjMxZDYyfDEjMmUzNDM2IzJlMzQzNiMyZTM0MzYjMmUzNDM2fDAjMmUzNDM2IzJlMzQzNiMyZTM0MzYjMmUzNDM2" },
	{ name: "Drachenköpfe", hash: "MjA6MjQ6MDAwMDAwMTEwMDAwMDAxMTAwMDAwMDAwMDAxMTAwMDAwMDExMDAwMDAwMDAxMTExMTEwMDAwMDAwMDAwMDAwMDExMTExMTAwMDAwMDAwMDAwMDAwMTEwMDExMTExMTAwMDAwMDAwMDAxMTAwMTExMTExMDAwMDAwMDAwMDAwMTExMTExMDAxMTAwMDAwMDAwMDAxMTExMTEwMDExMDAwMDAwMDAwMDAwMDAxMTExMTEwMDAwMDAwMDAwMDAwMDExMTExMTAwMDAwMDAwMTEwMDAwMDAxMTAwMDAwMDAwMDAxMTAwMDAwMDExMDAwMDAwMDAwMDAwMTEwMDAwMDAxMTAwMDAwMDAwMDAxMTAwMDAwMDExMDAwMDAwMDAxMTExMTEwMDAwMDAwMDAwMDAwMDExMTExMTAwMDAwMDAwMDAwMDAwMTEwMDExMTExMTAwMDAwMDAwMDAxMTAwMTExMTExMDAwMDAwMDAwMDAwMTExMTExMDAxMTAwMDAwMDAwMDAxMTExMTEwMDExMDAwMDAwMDAwMDAwMDAxMTExMTEwMDAwMDAwMDAwMDAwMDExMTExMTAwMDAwMDAwMTEwMDAwMDAxMTAwMDAwMDAwMDAxMTAwMDAwMDExMDAwMDAwOnwwI2E0MDAwMCNhNDAwMDAjYTQwMDAwI2E0MDAwMHwxI2VmMjkyOSNmNTc5MDAjZmNhZjNlI2ZmZDU5MXwwI2VmMjkyOSNmNTc5MDAjZmNhZjNlI2ZmZDU5MXwxI2E0MDAwMCNhNDAwMDAjYTQwMDAwI2E0MDAwMHwxI2NjMDAwMCNmY2U5NGYjY2MwMDAwI2ZjZTk0ZnwxI2ZjZTk0ZiNjYzAwMDAjZmNlOTRmI2VmMjkyOXwxI2NjMDAwMCNmY2U5NGYjY2MwMDAwI2ZjZTk0ZnwxI2ZjZTk0ZiNjYzAwMDAjZmNlOTRmI2NjMDAwMHwxI2NjMDAwMCNmY2U5NGYjY2MwMDAwI2ZjZTk0ZnwxI2ZjZTk0ZiNjYzAwMDAjZmNlOTRmI2NjMDAwMHwxI2NjMDAwMCNmY2U5NGYjY2MwMDAwI2ZjZTk0ZnwxI2ZjZTk0ZiNjYzAwMDAjZmNlOTRmI2NjMDAwMHwxI2NjMDAwMCNmY2U5NGYjY2MwMDAwI2ZjZTk0ZnwxI2ZjZTk0ZiNjYzAwMDAjZmNlOTRmI2NjMDAwMHwxI2NjMDAwMCNmY2U5NGYjZWYyOTI5I2ZjZTk0ZnwxI2ZjZTk0ZiNjYzAwMDAjZmNlOTRmI2NjMDAwMHwwI2E0MDAwMCNhNDAwMDAjYTQwMDAwI2E0MDAwMHwxI2VmMjkyOSNmNTc5MDAjZmNhZjNlI2ZmZDU5MXwwI2VmMjkyOSNmNTc5MDAjZmNhZjNlI2ZmZDU5MXwxI2E0MDAwMCNhNDAwMDAjYTQwMDAwI2E0MDAwMA==" },
	{ name: "Sulawesi", hash: "MjA6Njg6MDAwMTEwMDAwMTEwMDAwMTEwMDAwMDEwMDExMTExMTExMTEwMDEwMDAwMDExMDAwMTExMTAwMDExMDAwMDAxMTExMTAxMTExMDExMTExMDAwMDExMTEwMTAwMDAxMDExMTEwMDAwMTExMTAxMDAwMDEwMTExMTAwMDAxMTAwMTAxMTExMDEwMDExMDAwMDExMDAxMDExMTEwMTAwMTEwMDAwMTEwMDEwMDAwMDAxMDAxMTAwMDAxMTAwMTAwMDAwMDEwMDExMDAwMDAwMDAxMDExMTEwMTAwMDAwMDAwMDAwMDEwMTExMTAxMDAwMDAwMDAwMDAwMTAxMTExMDEwMDAwMDAwMDAwMDAxMDExMTEwMTAwMDAwMDAwMDAwMDEwMTExMTAxMDAwMDAwMDAwMDAwMTAxMTExMDEwMDAwMDAwMDExMDAxMDExMTEwMTAwMTEwMDAwMTEwMDEwMTExMTAxMDAxMTAwMDAxMTAwMDEwMDAwMDEwMDExMDAwMDExMDAwMTAwMDAwMTAwMTEwMDAwMTEwMDAxMDAxMTEwMTEwMDAwMDAxMTAwMDEwMDExMTAxMTAwMDAwMDAwMTExMDAwMDAxMDExMDAwMDAwMDAxMTEwMDAwMDEwMTEwMDAwMDAwMDExMDExMTAwMTAxMTAwMDAwMDAwMTEwMTExMDAxMDExMDAwMDAwMDAxMTEwMTEwMDAxMDAxMTAwMDAwMDExMTAxMTAwMDEwMDExMDAwMDAwMTExMDExMDAwMTAwMTEwMDAwMDAxMTEwMTEwMDAxMDAxMTAwMDAxMTAwMTAxMTAwMDEwMDExMDAwMDExMDAxMDExMDAwMTAwMTEwMDAwMTEwMDEwMTExMTEwMDAxMTAwMDAxMTAwMTAxMTExMTAwMDExMDAwMDExMDAxMDAwMTEwMTExMDAwMDAwMTEwMDEwMDAxMTAxMTEwMDAwMDAwMDExMDExMTExMDExMTAwMDAwMDAwMTEwMTExMTEwMTExMDAwMDAwMDAxMTAxMDAwMDEwMTEwMDAwMDAwMDExMDEwMDAwMTAxMTAwMDAwMDAwMTEwMTAwMDAxMDExMDAwMDAwMDAxMTAxMDAwMDEwMTEwMDAwMDAxMTExMDEwMDAwMTAxMTExMDAwMDExMTEwMTAwMDAxMDExMTEwMDAwMTExMTAxMDAwMDEwMTExMTAwMDAxMTExMDEwMDAwMTAxMTExMDAwMDAwMTEwMTExMTExMDExMDAwMDAwMDAxMTAxMTExMTEwMTEwMDAwMDAwMDExMDEwMDAwMTAxMTAwMDAwMDAwMTEwMTAwMDAxMDExMDAwMDAwMDAwMDEwMTExMTAxMDAwMDAwMDAwMDAwMTAxMTExMDEwMDAwMDAwMDAwMDAwMTAwMDAxMDAwMDAwMDAwMTAwMTExMDAwMDExMTAwMTAwMDAwMTEwMDAwMDAwMDAwMTEwMDAwMDEwMDExMTEwMDExMTEwMDEwMDAwMDExMDAwMDExMDAwMDExMDAwMDAxMDAxMTExMTExMTExMDAxMDAwMDAxMTAwMDExMTEwMDAxMTAwMDAwMTExMTEwMTExMTAxMTExMTAwMDAxMTExMDEwMDAwMTAxMTExMDAwMDExMTEwMTAwMDAxMDExMTEwMDAwMTEwMDEwMTExMTAxMDAxMTAwMDAxMTAwMTAxMTExMDEwMDExMDAwMDExMDAxMDAwMDAwMTAwMTEwMDAwMTEwMDEwMDAwMDAxMDAxMTAwMDAwMDAwMTAxMTExMDEwMDAwMDAwMDAwMDAxMDExMTEwMTAwMDAwMDp8MSMwNjZhMDAjMDY2YTAwIzA2NmEwMCMwNjZhMDB8MCMwNjZhMDAjMDY2YTAwIzA2NmEwMCMwNjZhMDB8MSM3M2QyMTYjMDY2YTAwIzRlOWEwNiNjYmZmYzR8MSMwNjZhMDAjNGU5YTA2I2NiZmZjNCM3M2QyMTZ8MCMwNjZhMDAjNzNkMjE2I2NiZmZjNCM0ZTlhMDZ8MCM0ZTlhMDYjMDY2YTAwIzczZDIxNiNjYmZmYzR8MSM3M2QyMTYjMDY2YTAwIzRlOWEwNiNjYmZmYzR8MCM0ZTlhMDYjMDY2YTAwIzczZDIxNiNjYmZmYzR8MSM3M2QyMTYjMDY2YTAwIzRlOWEwNiNjYmZmYzR8MSMwNjZhMDAjNGU5YTA2I2NiZmZjNCM3M2QyMTZ8MCMwNjZhMDAjNzNkMjE2I2NiZmZjNCM0ZTlhMDZ8MCM0ZTlhMDYjMDY2YTAwIzczZDIxNiNjYmZmYzR8MSM3M2QyMTYjMDY2YTAwIzRlOWEwNiNjYmZmYzR8MCM0ZTlhMDYjMDY2YTAwIzczZDIxNiNjYmZmYzR8MSM3M2QyMTYjMDY2YTAwIzRlOWEwNiNjYmZmYzR8MSMwNjZhMDAjNGU5YTA2I2NiZmZjNCM3M2QyMTZ8MCMwNjZhMDAjNzNkMjE2I2NiZmZjNCM0ZTlhMDZ8MCM0ZTlhMDYjMDY2YTAwIzczZDIxNiNjYmZmYzR8MSMwNjZhMDAjMDY2YTAwIzA2NmEwMCMwNjZhMDB8MCMwNjZhMDAjMDY2YTAwIzA2NmEwMCMwNjZhMDA=" },
	{ name: "Einzugsmuster Raute", hash: "MjA6MjM6MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMTExMTExMTExMTExMTExMDAwMDExMTExMTExMTExMTExMTEwMDAwMTExMTExMTExMTExMTExMTAwMDAxMTExMTExMTExMTExMTExMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTExMTExMTExMTExMTExMTAwMDAxMTExMTExMTExMTExMTExMDAwMDExMTExMTExMTExMTExMTEwMDAwMTExMTExMTExMTExMTExMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDExMTExMTExMTExMTExMTEwMDAwMTExMTExMTExMTExMTExMTAwMDAxMTExMTExMTExMTExMTExMDAwMDExMTExMTExMTExMTExMTEwMDp8MSNmY2U5NGYjZmNlOTRmI2ZjZTk0ZiNmY2U5NGZ8MCNmY2U5NGYjZmNlOTRmI2ZjZTk0ZiNmY2U5NGZ8MCM4MzAwOTgjODMwMDk4IzgzMDA5OCNmY2U5NGZ8MCM4MzAwOTgjODMwMDk4I2ZjZTk0ZiM4MzAwOTh8MCM4MzAwOTgjZmNlOTRmIzgzMDA5OCM4MzAwOTh8MCNmY2U5NGYjODMwMDk4IzgzMDA5OCNmYTAwZmZ8MSNmY2U5NGYjODMwMDk4IzgzMDA5OCNmYTAwZmZ8MSM4MzAwOTgjZmNlOTRmIzgzMDA5OCM4MzAwOTh8MSM4MzAwOTgjODMwMDk4I2ZjZTk0ZiM4MzAwOTh8MSNmYTAwZmYjODMwMDk4IzgzMDA5OCNmY2U5NGZ8MCNmYTAwZmYjODMwMDk4IzgzMDA5OCNmY2U5NGZ8MCM4MzAwOTgjODMwMDk4I2ZjZTk0ZiM4MzAwOTh8MCM4MzAwOTgjZmNlOTRmIzgzMDA5OCM4MzAwOTh8MCNmY2U5NGYjODMwMDk4IzgzMDA5OCNmYTAwZmZ8MSNmY2U5NGYjODMwMDk4IzgzMDA5OCNmYTAwZmZ8MSM4MzAwOTgjZmNlOTRmIzgzMDA5OCM4MzAwOTh8MSM4MzAwOTgjODMwMDk4I2ZjZTk0ZiM4MzAwOTh8MSM4MzAwOTgjODMwMDk4IzgzMDA5OCNmY2U5NGZ8MSNmY2U5NGYjZmNlOTRmI2ZjZTk0ZiNmY2U5NGZ8MCNmY2U5NGYjZmNlOTRmI2ZjZTk0ZiNmY2U5NGY=" },
	{ name: "Birka 6", hash: "MTM6MTk6MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDExMDAwMDAwMDAwMDAxMTAwMDAwMDAwMDExMTExMTExMTAwMDAxMTExMTExMTEwMDAwMTEwMDExMTExMDAwMDExMDAxMTExMTAwMDAwMDAwMTExMDAwMDAwMDAwMDExMTAwMDAwMDAwMDAxMDAwMDAwMDAwMDAwMTAwMDAwMDAwMTExMTAwMDExMDAwMDExMTEwMDAxMTAwMDAxMTExMDExMTEwMDAwMTExMTAxMTExMDAwMDExMTExMTExMTAwMDAxMTExMTExMTEwMDp8MCMyZTM0MzYjMmUzNDM2IzJlMzQzNiMyZTM0MzZ8MCMyZTM0MzYjMmUzNDM2IzJlMzQzNiMyZTM0MzZ8MCMyZTM0MzYjZmNlOTRmI2ZjZTk0ZiMyZTM0MzZ8MCNmY2U5NGYjZmNlOTRmIzJlMzQzNiMyZTM0MzZ8MCNmY2U5NGYjMmUzNDM2IzJlMzQzNiNmY2U5NGZ8MCMyZTM0MzYjMmUzNDM2I2ZjZTk0ZiNmY2U5NGZ8MSMyZTM0MzYjZmNlOTRmI2ZjZTk0ZiMyZTM0MzZ8MSMyZTM0MzYjMmUzNDM2I2ZjZTk0ZiNmY2U5NGZ8MSNmY2U5NGYjMmUzNDM2IzJlMzQzNiNmY2U5NGZ8MSNmY2U5NGYjZmNlOTRmIzJlMzQzNiMyZTM0MzZ8MSMyZTM0MzYjZmNlOTRmI2ZjZTk0ZiMyZTM0MzZ8MSMyZTM0MzYjMmUzNDM2IzJlMzQzNiMyZTM0MzZ8MSMyZTM0MzYjMmUzNDM2IzJlMzQzNiMyZTM0MzY=" },
	{ name: "Hallstatt 123", hash: "MTk6NzI6MDAwMDAxMTEwMDExMTEwMDAwMDAwMDAwMTExMTAwMTExMDAwMDAwMDAwMDExMTExMDAxMTAxMDAwMDAwMDAxMTExMTEwMDExMDAwMDAwMDAwMTExMTExMTAwMTEwMDAwMDAwMDExMTAwMDExMDAxMDAwMDAwMDAxMTEwMDAxMTEwMDAwMDAwMDExMTExMDAwMTExMTAwMDAwMDAxMTExMTAwMDExMTExMDAwMDAwMTExMTEwMDAxMTExMTAwMDAwMDAxMTExMDAwMTExMTEwMDAwMDAwMDExMTAwMDExMTAwMDAwMDAwMTAwMTEwMDAxMTEwMDAwMDAwMDExMDAxMTExMTExMDAwMDAwMDAwMTEwMDExMTExMTAwMDAwMDAwMTAxMTAwMTExMTEwMDAwMDAwMDAwMTExMDAxMTExMDAwMDAwMDAwMDExMTEwMDExMTAwMDAwMDAwMDAxMTExMTAwMTEwMTAwMDAwMDExMTExMTExMDAxMTAwMDAwMDAxMTExMTExMTEwMDExMDAwMDAwMDAwMDAwMTExMTAwMTAwMDAwMDAwMDAwMDExMTExMDAwMDAwMDAwMDAwMDAxMTExMTEwMDAwMDAwMDAwMDExMDAwMTExMTAwMDAwMDAwMDAxMTAwMDExMTEwMDAwMDAwMDAwMTEwMDAxMTExMDAwMDAwMTExMTAwMTExMDAwMDAwMDAwMDExMTEwMDExMTAwMDAwMDAwMDAxMTExMDAxMTEwMDAwMDAwMDAwMTExMTExMDAwMDAwMTAwMDAwMDExMTExMTAwMDAwMTEwMDAwMDAxMTExMTEwMDAwMTEwMDAwMDAwMDAwMDAwMDAwMTEwMDAwMDAwMDAwMDAwMDAwMTEwMDEwMDAwMDAxMTAwMDAwMTEwMDEwMDAwMDAwMTEwMDAwMTEwMDAxMTAwMDAwMDExMDAwMTEwMDAwMTEwMDAwMDAwMTAwMTEwMDAwMDExMDAwMDAwMTAwMTEwMDAwMDAxMTAwMDAwMDAwMTEwMDAwMDAwMTEwMDAwMDAwMTEwMDExMTAwMDExMDAwMDAwMTEwMDAxMTEwMDAxMTAwMDAwMDEwMDAwMTExMDAwMDAwMDAwMDAwMDAwMDExMTAwMDAwMDAwMDAwMDAwMDAxMTEwMDAwMDAwMDAwMDAwMDAwMTExMDAwMDEwMDAwMDAxMTAwMDExMTAwMDExMDAwMDAwMTEwMDAxMTEwMDExMDAwMDAwMDExMDAwMDAwMDExMDAwMDAwMDAxMTAwMDAwMDExMDAxMDAwMDAwMTEwMDAwMDExMDAxMDAwMDAwMDExMDAwMDExMDAwMTEwMDAwMDAxMTAwMDExMDAwMDExMDAwMDAwMDEwMDExMDAwMDAxMTAwMDAwMDEwMDExMDAwMDAwMDAwMDAwMDAwMDExMDAwMDAwMDAwMDAwMDAwMDExMDAwMDExMTExMTAwMDAwMDExMDAwMDAxMTExMTEwMDAwMDAxMDAwMDAwMTExMTExMDAwMDAwMDAwMDExMTAwMTExMTAwMDAwMDAwMDAxMTEwMDExMTEwMDAwMDAwMDAwMTExMDAxMTExMDAwMDAwMTExMTAwMDExMDAwMDAwMDAwMDExMTEwMDAxMTAwMDAwMDAwMDAxMTExMDAwMTEwMDAwMDAwMDAwMDExMTExMTAwMDAwMDAwMDAwMDAwMTExMTEwMDAwMDAwMDAwMDAxMDAxMTExMDAwMDAwMDAwMDAwMTEwMDExMTExMTExMTAwMDAwMDAxMTAwMTExMTExMTEwMDAwMDAxMDExMDAxMTExMTAwMDAwOnwxIzAwMTJmZiMwMDEyZmYjMDAxMmZmIzAwMTJmZnwxIzAwMTJmZiMwMDEyZmYjMDAxMmZmIzAwMTJmZnwxI2NjMDAwMCNjYzAwMDAjY2MwMDAwI2NjMDAwMHwwI2ZmZmZmZiMwMDEyZmYjMDAxMmZmI2ZmZmZmZnwwIzAwMTJmZiMwMDEyZmYjZmZmZmZmI2ZmZmZmZnwwI2ZmZmZmZiMwMDEyZmYjMDAxMmZmI2ZmZmZmZnwwIzAwMTJmZiMwMDEyZmYjZmZmZmZmI2ZmZmZmZnwwI2NjMDAwMCNmZmZmZmYjZmZmZmZmI2NjMDAwMHwwI2NjMDAwMCNjYzAwMDAjZmZmZmZmI2ZmZmZmZnwwI2ZmZmZmZiNjYzAwMDAjY2MwMDAwI2ZmZmZmZnwwI2NjMDAwMCNjYzAwMDAjZmZmZmZmI2ZmZmZmZnwwI2NjMDAwMCNmZmZmZmYjZmZmZmZmI2NjMDAwMHwwI2ZmZmZmZiNmZmZmZmYjMDAxMmZmIzAwMTJmZnwwI2ZmZmZmZiMwMDEyZmYjMDAxMmZmI2ZmZmZmZnwwI2ZmZmZmZiNmZmZmZmYjMDAxMmZmIzAwMTJmZnwwI2ZmZmZmZiMwMDEyZmYjMDAxMmZmI2ZmZmZmZnwwI2NjMDAwMCNjYzAwMDAjY2MwMDAwI2NjMDAwMHwwIzAwMTJmZiMwMDEyZmYjMDAxMmZmIzAwMTJmZnwwIzAwMTJmZiMwMDEyZmYjMDAxMmZmIzAwMTJmZg==" },
	{ name: "Dublin Dragons", hash: "MTg6MjQ6MDAwMDAxMTExMTEwMDExMDAwMDAwMDAxMTExMTEwMDExMDAwMDAwMDAwMDAwMTExMTExMDAwMDAwMDAwMDAwMTExMTExMDAwMDAwMTEwMDAwMDAxMTAwMDAwMDAwMTEwMDAwMDAxMTAwMDAwMDAwMDAxMTAwMDAwMDExMDAwMDAwMDAxMTAwMDAwMDExMDAwMDAwMTExMTExMDAwMDAwMDAwMDAwMTExMTExMDAwMDAwMDAwMDAwMTEwMDExMTExMTAwMDAwMDAwMTEwMDExMTExMTAwMDAwMDAwMDAxMTExMTEwMDExMDAwMDAwMDAxMTExMTEwMDExMDAwMDAwMDAwMDAwMTExMTExMDAwMDAwMDAwMDAwMTExMTExMDAwMDAwMTEwMDAwMDAxMTAwMDAwMDAwMTEwMDAwMDAxMTAwMDAwMDAwMDAxMTAwMDAwMDExMDAwMDAwMDAxMTAwMDAwMDExMDAwMDAwMTExMTExMDAwMDAwMDAwMDAwMTExMTExMDAwMDAwMDAwMDAwMTEwMDExMTExMTAwMDAwMDAwMTEwMDExMTExMTAwMDAwOnwxIzAwMDAwMCMwMDAwMDAjMDAwMDAwIzAwMDAwMHwxI2VmMjkyOSNlZjI5MjkjZWYyOTI5I2VmMjkyOXwxIzAwMDAwMCMwMDAwMDAjMDAwMDAwIzAwMDAwMHwxI2ZmZmZmZiNmY2U5NGYjZmZmZmZmI2VmMjkyOXwxI2VmMjkyOSNmZmZmZmYjZmNlOTRmI2ZmZmZmZnwxI2ZmZmZmZiNlZjI5MjkjZmZmZmZmI2ZjZTk0ZnwxI2ZjZTk0ZiNmZmZmZmYjZWYyOTI5I2ZmZmZmZnwxI2ZmZmZmZiNmY2U5NGYjZmZmZmZmI2VmMjkyOXwxI2VmMjkyOSNmZmZmZmYjZmNlOTRmI2ZmZmZmZnwxI2ZmZmZmZiNlZjI5MjkjZmZmZmZmI2ZjZTk0ZnwxI2ZjZTk0ZiNmZmZmZmYjZWYyOTI5I2ZmZmZmZnwxI2ZmZmZmZiNmY2U5NGYjZmZmZmZmI2VmMjkyOXwxI2VmMjkyOSNmZmZmZmYjZmNlOTRmI2ZmZmZmZnwxI2ZmZmZmZiNlZjI5MjkjZmZmZmZmI2ZjZTk0ZnwxI2ZjZTk0ZiNmZmZmZmYjZWYyOTI5I2ZmZmZmZnwwIzAwMDAwMCMwMDAwMDAjMDAwMDAwIzAwMDAwMHwwI2VmMjkyOSNlZjI5MjkjZWYyOTI5I2VmMjkyOXwwIzAwMDAwMCMwMDAwMDAjMDAwMDAwIzAwMDAwMA==" }
];

export const templates = readable(patternTemplates);
