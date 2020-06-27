module.exports = {
    getBuildState(env) {
        return {
            mode: env.production ? 'production' : 'development',
            watch: !env.production
        }
    }
}