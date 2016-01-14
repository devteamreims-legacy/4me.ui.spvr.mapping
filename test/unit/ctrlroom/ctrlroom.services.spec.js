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
    var treeSectors;

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
      ['ctrlroomManager', '$httpBackend', '$rootScope', '$q', 'mapping.errors', 'mapping.status', 'mapping.api', 'treeSectors',
      function(_ctrlroomManager_, _$httpBackend_, _$rootScope_, _$q_, _errors_, _status_, _api_, _treeSectors_) {
        ctrlroomManager = _ctrlroomManager_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        errors = _errors_;
        status = _status_;
        api = _api_;
        treeSectors = _treeSectors_;

        treeSectors.getFromSectors = sinon.stub().returns('UXH');
        treeSectors.getElem = sinon.stub().returns(['UH', 'XH', 'KH', 'HH', 'KD', 'KF', 'UF']);
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

      describe('addSectors', function() {
        it('should throw with wrong arguments', function() {
          var fn;
          fn = function() { return ctrlroomManager.addSectors(); };
          fn.should.throw();
          fn = function() { return ctrlroomManager.addSectors({}); };
          fn.should.throw();
          fn.should.throw();
          fn = function() { return ctrlroomManager.addSectors(2); };
          fn.should.throw();
          fn = function() { return ctrlroomManager.addSectors(20); };
          fn.should.throw();
          fn = function() { return ctrlroomManager.addSectors(20, {}); };
          fn.should.throw();
        });

        it('should reject unknown sectors', function() {
          var fn;
          fn = function() { return ctrlroomManager.addSectors(22, ['UE']); };
          fn.should.throw(/unknown sector/i);
        });

        it('should add sectors to current cwp', function() {
          ctrlroomManager.addSectors(21, ['UF']);
          ctrlroomManager.getCwp(21).sectors.should.include('UF');
        });

        it('should accept a string as input', function() {
          ctrlroomManager.addSectors(21, 'UF');
          ctrlroomManager.getCwp(21).sectors.should.include('UF');
        });

        it('should accept lowercase input', function() {
          ctrlroomManager.addSectors(21, 'uf');
          ctrlroomManager.getCwp(21).sectors.should.include('UF');
        });

        it('should remove sectors from other cwps', function() {
          ctrlroomManager.addSectors(21, ['UF']);
          ctrlroomManager.getCwp(20).sectors.should.not.include('UF');
        });

        it('should set the changed flags on all concerned cwps', function() {
          ctrlroomManager.addSectors(22, ['UH']);
          ctrlroomManager.getCwp(22).changed.should.eql(true);
          ctrlroomManager.getCwp(21).changed.should.eql(true);
          ctrlroomManager.getCwp(20).changed.should.eql(false);
        });

        it('should recompute sector string on all concerned cwps', function() {
          ctrlroomManager.addSectors(22, ['UF']);
          treeSectors.getFromSectors.should.have.been.calledWith(['UF']);
          treeSectors.getFromSectors.should.have.been.calledWith(['KD', 'KF']);
        });
      });

      describe('revert', function() {
        it('should provide a revert mecanism', function() {
          var oldCwp = _.clone(ctrlroomManager.getCwp(22));

          console.log(oldCwp);

          ctrlroomManager.addSectors(22, ['UF']);

          ctrlroomManager.revert();

          console.log(ctrlroomManager.getCwp(22));

          ctrlroomManager.getCwp(22).should.eql(oldCwp);
        });
      });
    });

  });
});
