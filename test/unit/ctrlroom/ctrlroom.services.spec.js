describe('4me.ui.spvr.mapping.ctrlroom.services', function() {
  beforeEach(module('4me.ui.spvr.mapping.ctrlroom.services'));

  describe('ctrlroomManager', function() {
    var ctrlroomManager;
    var $httpBackend;
    var $rootScope;
    var $q;
    var errors;
    var status;
    var api;

    var cdsBackendUrl = 'http://localhost:3000';

    var apiEndpoints = {
      getAll: cdsBackendUrl + '/cwp',
      getSingle: cdsBackendUrl + '/cwp/', // + positionId
      commit: '/cwp' // POST whole control room status
    };


    var resultsFromBackend = {
      getAll: [
        {
          id: 20,
          name: "P20",
          disabled: false,
          sectors: [
            "KD",
            "KF",
            "UF"
          ],
          sectorName: "KD2F"
        },
        {
          id: 21,
          name: "P21",
          disabled: false,
          sectors: [
            "HH",
            "KH",
            "UH",
            "XH"
          ],
          sectorName: "4H"
        },
        {
          id: 22,
          name: "P22",
          disabled: false,
          sectors: [],
          sectorName: ''
        }
      ]
    };

    beforeEach(inject(
      ['ctrlroomManager', '$httpBackend', '$rootScope', '$q', 'mapping.errors', 'mapping.status', 'mapping.api',
      function(_ctrlroomManager_, _$httpBackend_, _$rootScope_, _$q_, _errors_, _status_, _api_) {
        ctrlroomManager = _ctrlroomManager_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        errors = _errors_;
        status = _status_;
        api = _api_;
      }
    ]));

    it('should present a proper API', function() {
      ctrlroomManager.bootstrap.should.be.a('function');
      ctrlroomManager.getCwp.should.be.a('function');
      ctrlroomManager.refresh.should.be.a('function');
      ctrlroomManager.commit.should.be.a('function');
      ctrlroomManager.isLoading.should.be.a('function');
    });

    it('should return empty stuff when not bootstrapped', function() {
      ctrlroomManager.getCwp(2).should.eql({});
    });

    it('should be able to be bootstrapped', function(done) {
      $httpBackend
        .when('GET', api.rootPath + api.cwp.getAll)
        .respond(resultsFromBackend.getAll);

      ctrlroomManager.bootstrap()
        .should.be.fulfilled
        .and.notify(done);

      $httpBackend.flush();
    });

    describe('without backend', function() {
      beforeEach(function() {
        $httpBackend
          .when('GET', api.rootPath + api.cwp.getAll)
          .respond(404, '');

        status.escalate = sinon.stub();
        errors.add = sinon.stub().returns({});
      });

      it('should handle failure gracefully', function(done) {
        ctrlroomManager.bootstrap()
        .then(function(res) {
          // This should not happen
          (true).should.eql(false);
          done();
        })
        .catch(function(err) {
          errors.add.should.have.been.called;
          status.escalate.should.have.been.called;
          done();
        });

        $httpBackend.flush();
      });
    });


    describe('bootstrapped', function() {
      beforeEach(function() {
        $httpBackend
          .when('GET', api.rootPath + api.cwp.getAll)
          .respond(resultsFromBackend.getAll);

        ctrlroomManager.bootstrap()
          .should.be.fulfilled;

        $httpBackend.flush();
      });

      afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });

      it('should load data properly', function() {
        var cwp = ctrlroomManager.getCwp(20);
        cwp.should.be.a('object');
        cwp.should.include.keys('id', 'name', 'sectors', 'sectorName', 'changed');
      });
    });

  });
});
