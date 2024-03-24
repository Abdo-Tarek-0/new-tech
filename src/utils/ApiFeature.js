export default class ApiFeature {
   constructor(mongooseQuery, queryString) {
      this.mongooseQuery = mongooseQuery
      this.queryString = queryString
   }

   //![1]to make pagination
   paginate() {
      this.pageSize = this.queryString.limit * 1 || 5
      let page = this.queryString.page * 1 || 1
      if (this.queryString.page <= 0) page = 1
      const skip = (page - 1) * this.pageSize
      this.page = page
      //? to get count of document
      // this.mongooseQuery.model.countDocuments().then((data) => {
      //   this.totalCount = this.mongooseQuery.model.countDocuments();
      // });
      // this.totalCount = this.mongooseQuery.model.countDocuments();
      this.mongooseQuery.skip(skip).limit(this.pageSize)
      return this
   }

   //![2] to make filter
   filter() {
      let filterObj = { ...this.queryString }
      const excludedQuery = ['page', 'sort', 'fields', 'keyword']
      excludedQuery.forEach((q) => {
         delete filterObj[q]
      })
      filterObj = JSON.stringify(filterObj)
      filterObj = filterObj.replace(
         /\b(gt|gte|lt|lte)\b/g,
         (match) => `$${match}`
      )
      filterObj = JSON.parse(filterObj)
      this.filter = filterObj
      this.mongooseQuery.find(filterObj)
      // this.totalCount = clonedQuery.countDocuments();
      return this
   }

   //! [3] to make sort
   sort() {
      if (this.queryString.sort) {
         const sortBy = this.queryString.sort.replace(/,/g, ' ')
         this.mongooseQuery.sort(sortBy)
      }
      return this
   }

   //![3] to make search
   search() {
      if (this.queryString.keyword) {
         this.mongooseQuery.find({
            $or: [
               {
                  title: { $regex: this.queryString.keyword, $option: 'i' },
               },
               {
                  description: {
                     $regex: this.queryString.keyword,
                     $option: 'i',
                  },
               },
            ],
         })
      }
      return this
   }

   //![4] to make select
   fields() {
      if (this.queryString.fields) {
         const fields = this.queryString.fields.replace(/,/g, ' ')
         this.mongooseQuery.select(fields)
      }
      return this
   }
   //?this code for return total document in db
   // async totalCount() {
   //   this.totalCount = await this.mongooseQuery.model.countDocuments();
   //   return this;
   // }
   //  const totalPages = await new ApiFeature(
   //   userModel.find(),
   //   request.query
   // ).totalCount();
   // console.log(totalPages.totalCount);
}

// queryString === request.query;
