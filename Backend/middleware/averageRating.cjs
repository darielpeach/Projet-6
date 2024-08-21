const calculateAverageRating = (ratings) => {
    if (ratings.length === 0) return 0
    const total = ratings.reduce((acc, rating) => acc + rating.grade, 0)
    return total / ratings.length
}

const applyAverage = (bookSchema) => {
    bookSchema.pre('save', function(next) {
        this.averageRating = calculateAverageRating(this.ratings)
        next()
    })

    bookSchema.pre('updateOne', function(next) {
        const update = this.getUpdate()
        if (update.ratings) {
            update.averageRating = calculateAverageRating(update.ratings)
        }
        next()
    })
}

module.exports = {
    calculateAverageRating,
    applyAverage
};