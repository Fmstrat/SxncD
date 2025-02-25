DROP TABLE IF EXISTS public.user CASCADE;
CREATE TABLE public.user (
    id                  BIGSERIAL PRIMARY KEY,
    username            TEXT,
    photo               TEXT,
    issuer              TEXT NOT NULL,
    identifier          TEXT NOT NULL,
    created_ts          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_ts          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uniq__user__issuer_identifier UNIQUE (issuer, identifier)
);
CREATE INDEX idx__user__username   ON public.user (username);
CREATE INDEX idx__user__identifier ON public.user (identifier);
CREATE INDEX idx__user__issuer     ON public.user (issuer);
CREATE INDEX idx__user__created_ts ON public.user (created_ts);
CREATE INDEX idx__user__updated_ts ON public.user (updated_ts);

DROP TABLE IF EXISTS public.device CASCADE;
CREATE TABLE public.device (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES public.user(id),
    identifier          TEXT NOT NULL,
    last_sync_ts        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_ts          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_ts          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uniq__device__user_id_identifier UNIQUE (user_id, identifier)
);
CREATE INDEX idx__device__user_id      ON public.device (user_id);
CREATE INDEX idx__device__identifier   ON public.device (identifier);
CREATE INDEX idx__device__last_sync_ts ON public.device (last_sync_ts);
CREATE INDEX idx__device__created_ts   ON public.device (created_ts);
CREATE INDEX idx__device__updated_ts   ON public.device (updated_ts);

DROP TABLE IF EXISTS public.app CASCADE;
CREATE TABLE public.app (
    id                  BIGSERIAL PRIMARY KEY,
    type                TEXT UNIQUE NOT NULL,
    created_ts          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_ts          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx__app__type       ON public.app (type);
CREATE INDEX idx__app__created_ts ON public.app (created_ts);
CREATE INDEX idx__app__updated_ts ON public.app (updated_ts);

DROP TABLE IF EXISTS public.app_device CASCADE;
CREATE TABLE public.app_device (
    id                  BIGSERIAL PRIMARY KEY,
    device_id           BIGINT NOT NULL REFERENCES public.device(id),
    app_id              BIGINT NOT NULL REFERENCES public.app(id),
    last_sync_ts        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_ts          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_ts          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uniq__app_device__device_id_app_id UNIQUE (device_id, app_id)
);
CREATE INDEX idx__app_device__device_id    ON public.app_device (device_id);
CREATE INDEX idx__app_device__app_id       ON public.app_device (app_id);
CREATE INDEX idx__app_device__last_sync_ts ON public.app_device (last_sync_ts);
CREATE INDEX idx__app_device__created_ts   ON public.app_device (created_ts);
CREATE INDEX idx__app_device__updated_ts   ON public.app_device (updated_ts);

DROP TABLE IF EXISTS public.auth CASCADE;
CREATE TABLE public.auth (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES public.user(id),
    app_id              BIGINT NOT NULL REFERENCES public.app(id),
    api_key             TEXT NOT NULL,
    last_sync_ts        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_ts          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_ts          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uniq__auth__user_id_app_id UNIQUE (user_id, app_id)
);
CREATE INDEX idx__auth__user_id      ON public.auth (user_id);
CREATE INDEX idx__auth__app_id       ON public.auth (app_id);
CREATE INDEX idx__auth__api_key      ON public.auth (api_key);
CREATE INDEX idx__auth__last_sync_ts ON public.auth (last_sync_ts);
CREATE INDEX idx__auth__created_ts   ON public.auth (created_ts);
CREATE INDEX idx__auth__updated_ts   ON public.auth (updated_ts);

DROP TABLE IF EXISTS public.settings CASCADE;
CREATE TABLE public.settings (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES public.user(id),
    app_id              BIGINT NOT NULL REFERENCES public.app(id),
    data                TEXT NOT NULL,
    last_sync_device_id BIGINT NOT NULL REFERENCES public.device(id),
    last_sync_ts        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_ts          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_ts          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uniq__settings__user_id_app_id UNIQUE (user_id, app_id)
);
CREATE INDEX idx__settings__user_id             ON public.settings (user_id);
CREATE INDEX idx__settings__app_id              ON public.settings (app_id);
CREATE INDEX idx__settings__last_sync_device_id ON public.settings (last_sync_device_id);
CREATE INDEX idx__settings__last_sync_ts        ON public.settings (last_sync_ts);
CREATE INDEX idx__settings__created_ts          ON public.settings (created_ts);
CREATE INDEX idx__settings__updated_ts          ON public.settings (updated_ts);

-- CREATE SCHEMA IF NOT EXISTS audit;

-- DROP TABLE IF EXISTS audit.settings CASCADE;
-- CREATE TABLE audit.settings (
--     id                  BIGSERIAL PRIMARY KEY,
--     user_id             BIGINT NOT NULL REFERENCES public.user(id),
--     device_id           BIGINT NOT NULL REFERENCES public.device(id),
--     app_id              BIGINT NOT NULL REFERENCES public.app(id),
--     data                JSONB NOT NULL,
--     created_ts          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--     updated_ts          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--     CONSTRAINT uniq__settings__user_device_app UNIQUE (user_id, device_id, app_id)
-- );
-- CREATE INDEX idx__audit_settings__created_ts ON audit.settings (created_ts);
-- CREATE INDEX idx__audit_settings__updated_ts ON audit.settings (updated_ts);