var _ = require('lodash')
  , async = require('async')
  , should = require('should')
  , assert = require('assert')

module.exports = function(idProperty, getEngine) {

  describe('#find()', function () {

    it('should return empty array when no data matches query ', function (done) {
      getEngine(function (error, engine) {
        engine.find({ a: 1 }, {}, function (error, objects) {

          objects.length.should.eql(0)
          done()
        })
      })

    })

    it('should emit a \'find\' event', function (done) {
      getEngine(function (error, engine) {
        engine.on('find', function (entity) {
          entity.should.eql({ a: 1 })
          done()
        })

        engine.find({ a: 1 }, {}, function () {
        })

      })
    })

    it('should emit a \'received\' event', function (done) {
      getEngine(function (error, engine) {
        async.map([ { a: 1 } ], engine.create, function () {

          engine.on('received', function (data) {
            assert.equal(data.length, 1)
            assert.equal(data[0].a, 1)
            done()
          })

          engine.find({ a: 1 }, {}, function () {
          })

        })
      })
    })

    it('should return array of objects for a single clause query that matches existing objects', function (done) {

      getEngine(function (error, engine) {
        async.map([ { a: 1 } ], engine.create, function () {
          engine.find({ a: 1 }, {}, function (error, objects) {
            objects.length.should.not.eql(0)
            objects[0].a.should.equal(1)
            done()
          })
        })
      })

    })

    it('should still return expected objects when callback is second parameter', function (done) {

      getEngine(function (error, engine) {
        async.map([ { a: 1 } ], engine.create, function () {
          engine.find({ a: 1 }, function (error, objects) {
            objects.length.should.not.eql(0)
            objects[0].a.should.equal(1)
            done()
          })
        })
      })

    })

    it('should not error if a query property is not in object collection', function (done) {

      getEngine(function (error, engine) {
        async.map([ { a: 1 } ], engine.create, function () {
          engine.find({ b: 1 }, {}, function (error, objects) {
            should.not.exist(error)
            objects.length.should.eql(0)
            done()
          })
        })
      })

    })

    it('should return array of objects that match all properties in query ', function (done) {
      getEngine(function (error, engine) {
        async.map([ { findTest: 1 }, { findTest: 1 }, { findTest: 1 }, { b: 1 } ], engine.create, function () {
          engine.find({ findTest: 1 }, {}, function (error, objects) {
            objects.length.should.equal(3)
            done()
          })
        })
      })
    })

    it('should allow $gt operator', function (done) {
      getEngine(function (error, engine) {
        async.map([ { findTest: 1 }, { findTest: 2 }, { findTest: 3 }, { findTest: 4 } ], engine.create, function () {
          engine.find({ findTest: { $gt: 2 } }, function (error, objects) {
            objects.length.should.equal(2)
            done()
          })
        })
      })
    })

    it('should allow $lt operator', function (done) {
      getEngine(function (error, engine) {
        async.map([ { findTest: 0.8 }, { findTest: 1.9 }, { findTest: 3 }, { findTest: 4 } ], engine.create, function () {
          engine.find({ findTest: { $lt: 2 } }, function (error, objects) {
            objects.length.should.equal(2)
            objects[0].findTest.should.equal(0.8)
            done()
          })
        })
      })
    })

    it('should return all objects with properties in a given array ($in)', function (done) {
      getEngine(function (error, engine) {
        async.map([ { findTest: 1 }, { findTest: 2 }, { findTest: 3 } ], engine.create, function () {
          engine.find({ findTest: { $in: [ 1, 3 ] } }, {}, function (error, objects) {
            objects.length.should.equal(2)
            done()
          })
        })
      })
    })

    it('should return array of objects that match specified fields of a subdocument in query', function (done) {
      getEngine(function (error, engine) {
        async.map([ { findTest: { nested: 1 } }, { findTest: { nested: 1 } }, { findTest: { nested: 2 } }, { b: 1 } ], engine.create, function () {
          engine.find({ 'findTest.nested': 1 }, {}, function (error, objects) {
            objects.length.should.equal(2)
            done()
          })
        })
      })
    })

    it('should return array of objects that match specified fields of a deep subdocument in query', function (done) {
      getEngine(function (error, engine) {
        async.map(
            [ { findTest: { nested: 1 } }
            , { findTest: { nested: { nested: 1 } } }
            , { findTest: { nested: { nested: 1 } } }
            , { b: 1 } ]
            , engine.create, function () {
          engine.find({ 'findTest.nested.nested': 1 }, {}, function (error, objects) {
            objects.length.should.equal(2)
            done()
          })
        })
      })
    })

    it('should return array of all objects for an empty query {}', function (done) {
      getEngine(function (error, engine) {
        async.map([ { a: 1 }, { a: 1 }, { a: 1 }, { b: 1 } ], engine.create, function () {
          engine.find({}, {}, function (error, objects) {
            objects.length.should.equal(4)
            done()
          })
        })
      })
    })

    it('should support { fields: {} } projection in options', function (done) {
      getEngine(function (error, engine) {
        async.map([ { a: 1, b: 1 }, { a: 2, b: 2 }, { b: 3, c: 3 }, { b: 4, c: 4 } ], engine.create, function () {
          engine.find({}, { fields: { b: 1, c: 1 }, sort: { b: 1 } }, function (error, objects) {
            objects.map(function(object) { delete object._id; return object })
              .should.eql([ { b: 1 }, { b: 2 }, { b: 3, c: 3 }, { b: 4, c: 4 } ])
            done()
          })
        })
      })
    })

    it('should return array of all objects for an empty query {} when there are no options', function (done) {
      getEngine(function (error, engine) {
        async.map([ { a: 1 }, { a: 1 }, { a: 1 }, { b: 1 } ], engine.create, function () {
          engine.find({}, function (error, objects) {
            objects.length.should.equal(4)
            done()
          })
        })
      })
    })

    it('should return array of objects in ascending order', function (done) {
      getEngine(function (error, engine) {
        async.map([ { a: 3 }, { a: 1 }, { a: 2 } ], engine.create, function () {
          engine.find({}, { sort: { a: 1 } }, function (error, objects) {
            objects[0].a.should.equal(1)
            objects[1].a.should.equal(2)
            objects[2].a.should.equal(3)
            done()
          })
        })
      })
    })

    it('should return array of objects in descending order', function (done) {
      getEngine(function (error, engine) {
        async.map([ { a: 3 }, { a: 1 }, { a: 2 } ], engine.create, function () {
          engine.find({}, { sort: { a: -1 } }, function (error, objects) {
            objects[0].a.should.equal(3)
            objects[1].a.should.equal(2)
            objects[2].a.should.equal(1)
            done()
          })
        })
      })
    })

    it('should return a new cloned object', function () {
      var item = { a: 1 }
        , dataClone = _.clone(item)

      getEngine(function (error, engine) {
        async.map([ item ], engine.create, function (error, createdObject) {
          delete createdObject.a

          createdObject[0].should.not.eql(dataClone)
          item.should.have.property('a')
          engine.read(createdObject[0]._id, function (error, item) {
            item.should.have.property('a')
            item.should.have.property('_id')
          })
        })
      })
    })

    it('should return id of type string', function (done) {
      getEngine(function (error, engine) {
        async.map([ { a: 3 } ], engine.create, function () {
          engine.find({}, { sort: [ [ 'a', 'desc' ] ] }, function (error, objects) {
            objects[0][idProperty].should.be.type('string')
            done()
          })
        })
      })
    })

  })

}
