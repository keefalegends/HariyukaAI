-- ==============================================================================
-- HARIYUKA AI: INITIAL DATABASE SCHEMA MIGRATION
-- Open-Source / Self-Hosted Multi-Step Agentic SEO Writer
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENUMS & CUSTOM TYPES
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE article_status_type AS ENUM (
        'draft',
        'outline_pending',
        'generating',
        'completed',
        'failed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_status_type AS ENUM (
        'pending',
        'processing',
        'waiting_user_input',
        'completed',
        'failed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 2. USERS TABLE (Self-Hosted / Linked with Supabase Auth)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 3. PROJECTS TABLE (Brand Voice & Target Domain Settings)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_domain TEXT,
    brand_voice_instructions TEXT,
    default_language VARCHAR(10) NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 4. ARTICLES TABLE (Core Content Records - Unlimited)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    target_keyword TEXT NOT NULL,
    secondary_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    tone TEXT NOT NULL DEFAULT 'authoritative',
    target_length INTEGER NOT NULL DEFAULT 2000,
    outline_json JSONB,
    serp_data JSONB,
    content_markdown TEXT,
    content_html TEXT,
    status article_status_type NOT NULL DEFAULT 'draft',
    word_count INTEGER NOT NULL DEFAULT 0,
    seo_score INTEGER NOT NULL DEFAULT 0,
    seo_audit JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 5. GENERATION JOBS TABLE (Asynchronous Multi-Step Pipeline Tracking)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.generation_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    current_step INTEGER NOT NULL DEFAULT 1,
    total_steps INTEGER NOT NULL DEFAULT 5,
    step_name TEXT NOT NULL DEFAULT 'serp_analysis',
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    status job_status_type NOT NULL DEFAULT 'pending',
    logs JSONB NOT NULL DEFAULT '[]'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 6. INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON public.articles(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_project_id ON public.articles(project_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_article_id ON public.generation_jobs(article_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status ON public.generation_jobs(status);

-- ------------------------------------------------------------------------------
-- 7. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS tr_users_updated_at ON public.users;
CREATE TRIGGER tr_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_projects_updated_at ON public.projects;
CREATE TRIGGER tr_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_articles_updated_at ON public.articles;
CREATE TRIGGER tr_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_generation_jobs_updated_at ON public.generation_jobs;
CREATE TRIGGER tr_generation_jobs_updated_at
    BEFORE UPDATE ON public.generation_jobs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 8. AUTOMATIC USER PROFILE SYNC (Auth -> Public Users)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
CREATE POLICY "Users can read own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- PROJECTS POLICIES
CREATE POLICY "Users can manage their own projects"
    ON public.projects FOR ALL
    USING (auth.uid() = user_id);

-- ARTICLES POLICIES
CREATE POLICY "Users can manage their own articles"
    ON public.articles FOR ALL
    USING (auth.uid() = user_id);

-- GENERATION JOBS POLICIES
CREATE POLICY "Users can view jobs for their articles"
    ON public.generation_jobs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.articles
            WHERE articles.id = generation_jobs.article_id
            AND articles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert or update jobs for their articles"
    ON public.generation_jobs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.articles
            WHERE articles.id = generation_jobs.article_id
            AND articles.user_id = auth.uid()
        )
    );

-- SERVICE ROLE BYPASS POLICIES (for backend background workers)
CREATE POLICY "Service role full access to users"
    ON public.users FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to projects"
    ON public.projects FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to articles"
    ON public.articles FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to generation_jobs"
    ON public.generation_jobs FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);
