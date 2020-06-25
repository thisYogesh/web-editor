module.exports = {
    getBuildState({ production }) {
        return {
            mode: production ? 'production' : 'development',
            watch: !production
        }
    }
}