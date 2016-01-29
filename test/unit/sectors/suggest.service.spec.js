describe('4me.ui.spvr.mapping.sectors.services', function() {
  beforeEach(module('4me.ui.spvr.mapping.sectors.services'));

  describe('sectorSuggestion', function() {
    var sectorSuggestion;
    var $httpBackend;
    var $rootScope;
    var $q;
    var errors;
    var status;
    var api;
    var treeSectors;

    var cwpId = 22;

    var endpoints = {
      suggest: ''
    };

    var backend = {};

    var resultsFromBackend = {
      suggest: [
        {
          sectors: [
            "UN",
            "KB"
          ]
        },
        {
          sectors: [
            "UR",
            "XR"
          ]
        },
        {
          sectors: [
            "KR",
            "YR",
            "HR"
          ]
        }
      ]
    };

    beforeEach(inject(
      ['sectorSuggestion', '$httpBackend', '$rootScope', '$q', 'mapping.errors', 'mapping.status', 'mapping.api',
      function(_sectorSuggestion_, _$httpBackend_, _$rootScope_, _$q_, _errors_, _status_, _api_) {
        sectorSuggestion = _sectorSuggestion_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        errors = _errors_;
        status = _status_;
        api = _api_;

        endpoints.suggest = api.rootPath + api.mapping.suggest(cwpId);
      }
    ]));

    it('should present a proper API', function() {
      sectorSuggestion.get.should.be.a('function');
    });

    describe('get', function() {
      it('should reject invalid arguments', function() {
        sectorSuggestion.get().should.be.rejectedWith('invalid argument');
        sectorSuggestion.get(0).should.be.rejectedWith('invalid argument');
      });

      it('should prevent multiple requests from being sent simultaneously', function() {
        var p = sectorSuggestion.get(cwpId);
        sectorSuggestion.get(cwpId).should.deep.eql(p);
      });

      describe('without backend', function() {
        beforeEach(function() {
          $httpBackend
            .when('GET', endpoints.suggest)
            .respond(404, '');

          errors.add = sinon.stub().returns({});
        });

        it('should handle failure gracefully', function(done) {
          sectorSuggestion.get(cwpId)
          .then(function(res) {
            // This should not happen
            (true).should.eql(false);
            done();
          })
          .catch(function(err) {
            errors.add.should.have.been.called;
            done();
          });

          $httpBackend.flush();
        });
      });

      describe('with backend', function() {
        beforeEach(function() {
          $httpBackend
            .when('GET', endpoints.suggest)
            .respond(resultsFromBackend.suggest);

          errors.add = sinon.stub().returns({});
        });

        it('should return data', function() {
          sectorSuggestion.get(cwpId).should.be.fulfilled;
          $httpBackend.flush();
        });

        it('should return properly formatted data', function(done) {
          sectorSuggestion.get(cwpId)
          .then(function(suggestions) {
            suggestions.length.should.eql(3);
            suggestions[0].should.have.keys('sectors');
            done();
          })
          .catch(function(err) {
            throw new Error('should never happen !');
          });

          $httpBackend.flush();
        });
      });
    });
  });
});
