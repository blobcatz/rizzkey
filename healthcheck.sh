#!/bin/bash

# SPDX-FileCopyrightText: syuilo and rizzkey-project
# SPDX-License-Identifier: AGPL-3.0-only

PORT=$(grep '^port:' /rizzkey/.config/default.yml | awk 'NR==1{print $2; exit}')
curl -s -S -o /dev/null "http://localhost:${PORT}"
