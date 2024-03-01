# syntax = docker/dockerfile:1.4

ARG NODE_VERSION=20.10.0-bullseye

# build assets & compile TypeScript

FROM --platform=$BUILDPLATFORM node:${NODE_VERSION} AS native-builder

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
	--mount=type=cache,target=/var/lib/apt,sharing=locked \
	rm -f /etc/apt/apt.conf.d/docker-clean \
	; echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache \
	&& apt-get update \
	&& apt-get install -yqq --no-install-recommends \
	build-essential

RUN corepack enable

WORKDIR /rizzkey

COPY --link ["pnpm-lock.yaml", "pnpm-workspace.yaml", "package.json", "./"]
COPY --link ["scripts", "./scripts"]
COPY --link ["packages/backend/package.json", "./packages/backend/"]
COPY --link ["packages/frontend/package.json", "./packages/frontend/"]
COPY --link ["packages/sw/package.json", "./packages/sw/"]
COPY --link ["packages/rizzkey-js/package.json", "./packages/rizzkey-js/"]
COPY --link ["packages/rizzkey-reversi/package.json", "./packages/rizzkey-reversi/"]
COPY --link ["packages/rizzkey-bubble-game/package.json", "./packages/rizzkey-bubble-game/"]

ARG NODE_ENV=production

RUN --mount=type=cache,target=/root/.local/share/pnpm/store,sharing=locked \
	pnpm i --frozen-lockfile --aggregate-output

COPY --link . ./

RUN git submodule update --init
RUN pnpm build
RUN rm -rf .git/

# build native dependencies for target platform

FROM --platform=$TARGETPLATFORM node:${NODE_VERSION} AS target-builder

RUN apt-get update \
	&& apt-get install -yqq --no-install-recommends \
	build-essential

RUN corepack enable

WORKDIR /rizzkey

COPY --link ["pnpm-lock.yaml", "pnpm-workspace.yaml", "package.json", "./"]
COPY --link ["scripts", "./scripts"]
COPY --link ["packages/backend/package.json", "./packages/backend/"]
COPY --link ["packages/rizzkey-js/package.json", "./packages/rizzkey-js/"]
COPY --link ["packages/rizzkey-reversi/package.json", "./packages/rizzkey-reversi/"]
COPY --link ["packages/rizzkey-bubble-game/package.json", "./packages/rizzkey-bubble-game/"]

ARG NODE_ENV=production

RUN --mount=type=cache,target=/root/.local/share/pnpm/store,sharing=locked \
	pnpm i --frozen-lockfile --aggregate-output

FROM --platform=$TARGETPLATFORM node:${NODE_VERSION}-slim AS runner

ARG UID="991"
ARG GID="991"

RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
	ffmpeg tini curl libjemalloc-dev libjemalloc2 \
	&& ln -s /usr/lib/$(uname -m)-linux-gnu/libjemalloc.so.2 /usr/local/lib/libjemalloc.so \
	&& corepack enable \
	&& groupadd -g "${GID}" rizzkey \
	&& useradd -l -u "${UID}" -g "${GID}" -m -d /rizzkey rizzkey \
	&& find / -type d -path /sys -prune -o -type d -path /proc -prune -o -type f -perm /u+s -ignore_readdir_race -exec chmod u-s {} \; \
	&& find / -type d -path /sys -prune -o -type d -path /proc -prune -o -type f -perm /g+s -ignore_readdir_race -exec chmod g-s {} \; \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists

USER rizzkey
WORKDIR /rizzkey

COPY --chown=rizzkey:rizzkey --from=target-builder /rizzkey/node_modules ./node_modules
COPY --chown=rizzkey:rizzkey --from=target-builder /rizzkey/packages/backend/node_modules ./packages/backend/node_modules
COPY --chown=rizzkey:rizzkey --from=target-builder /rizzkey/packages/rizzkey-js/node_modules ./packages/rizzkey-js/node_modules
COPY --chown=rizzkey:rizzkey --from=target-builder /rizzkey/packages/rizzkey-reversi/node_modules ./packages/rizzkey-reversi/node_modules
COPY --chown=rizzkey:rizzkey --from=target-builder /rizzkey/packages/rizzkey-bubble-game/node_modules ./packages/rizzkey-bubble-game/node_modules
COPY --chown=rizzkey:rizzkey --from=native-builder /rizzkey/built ./built
COPY --chown=rizzkey:rizzkey --from=native-builder /rizzkey/packages/rizzkey-js/built ./packages/rizzkey-js/built
COPY --chown=rizzkey:rizzkey --from=native-builder /rizzkey/packages/rizzkey-reversi/built ./packages/rizzkey-reversi/built
COPY --chown=rizzkey:rizzkey --from=native-builder /rizzkey/packages/rizzkey-bubble-game/built ./packages/rizzkey-bubble-game/built
COPY --chown=rizzkey:rizzkey --from=native-builder /rizzkey/packages/backend/built ./packages/backend/built
COPY --chown=rizzkey:rizzkey --from=native-builder /rizzkey/fluent-emojis /rizzkey/fluent-emojis
COPY --chown=rizzkey:rizzkey . ./

ENV LD_PRELOAD=/usr/local/lib/libjemalloc.so
ENV NODE_ENV=production
HEALTHCHECK --interval=5s --retries=20 CMD ["/bin/bash", "/rizzkey/healthcheck.sh"]
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["pnpm", "run", "migrateandstart"]
