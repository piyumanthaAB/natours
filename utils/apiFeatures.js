class APIFeatures{
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludes = ['page', 'sort', 'limit', 'fields'];

        excludes.forEach(el => {
            delete queryObj[el];
        });

        var queryStr = JSON.stringify(queryObj);
        queryStr= queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        
        return this;
    }
    sort() {
        if (this.queryString.sort) {
            
            const sortBy = this.queryString.sort.split(',').join(' ');
            console.log(sortBy);
            this.query = this.query.sort(sortBy);
            
        } 
        return this;
    }

    limiting() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paging() {
        const page = parseInt(this.queryString.page) || 1; // 1 is the default value
        const limit = parseInt(this.queryString.limit) || 100; // 100 is the default

        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        
        return this;
    }
}

module.exports = APIFeatures;