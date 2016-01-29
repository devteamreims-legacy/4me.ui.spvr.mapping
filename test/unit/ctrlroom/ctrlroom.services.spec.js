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

    var backend = {};

    // Our service has these 2 requests :
    /*
      $http.get(api.rootPath + api.cwp.getAll, {params: {type: 'cwp'}}),
      $http.get(api.rootPath + api.mapping.getMap)
    */

    var resultsFromBackend = {
      getMap: [
        {
          cwpId: 20,
          sectors: ['KD', 'UF', 'KF']
        }, {
          cwpId: 21,
          sectors: ['UH', 'XH', 'KH', 'HH']
        }, {
          cwpId: 22,
          sectors: []
        }
      ],
      getAll: [
        {
          id: 20,
          name: "P20",
          disabled: false,
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

        treeSectors.getFromSectors = sinon.stub().returns({name: 'UXH'});
        treeSectors.getElementary = sinon.stub().returns(['UH', 'XH', 'KH', 'HH', 'KD', 'KF', 'UF']);
      }
    ]));

    it('should present a proper API', function() {
      ctrlroomManager.bootstrap.should.be.a('function');
      ctrlroomManager.getCwp.should.be.a('function');
      ctrlroomManager.refresh.should.be.a('function');
      ctrlroomManager.commit.should.be.a('function');
      ctrlroomManager.revert.should.be.a('function');
      ctrlroomManager.isLoading.should.be.a('function');
      ctrlroomManager.hasChanges.should.be.a('function');
    });

    it('should return empty stuff when not bootstrapped', function() {
      ctrlroomManager.getCwp(2).should.eql({});
    });

    it('should be able to be bootstrapped', function(done) {
      backend.getAll = $httpBackend
        .whenGET(api.rootPath + api.cwp.getAll + '?type=cwp')
        .respond(resultsFromBackend.getAll);

      backend.getMap = $httpBackend
        .when('GET', api.rootPath + api.mapping.getMap)
        .respond(resultsFromBackend.getMap);

      ctrlroomManager.bootstrap()
        .should.be.fulfilled
        .and.notify(done);

      $httpBackend.flush();
    });

    it('should be able to be bootstrapped only once', function(done) {
      $httpBackend
        .expectGET(api.rootPath + api.cwp.getAll + '?type=cwp')
        .respond(resultsFromBackend.getAll);

      $httpBackend
        .expectGET(api.rootPath + api.mapping.getMap)
        .respond(resultsFromBackend.getMap);

      ctrlroomManager.bootstrap()
        .then(function(cwps) {
          ctrlroomManager.bootstrap()
            .should.be.fulfilled
            .and.eventually.eql(cwps)
            .and.notify(done);
        });

      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('without backend', function() {
      beforeEach(function() {
        $httpBackend
          .when('GET', api.rootPath + api.cwp.getAll + '?type=cwp')
          .respond(404, '');

        $httpBackend
          .when('GET', api.rootPath + api.mapping.getMap)
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
        backend.getAll = $httpBackend
          .whenGET(api.rootPath + api.cwp.getAll + '?type=cwp')
          .respond(resultsFromBackend.getAll);

        backend.getMap = $httpBackend
          .when('GET', api.rootPath + api.mapping.getMap)
          .respond(resultsFromBackend.getMap);

        backend.commit = $httpBackend
          .when('POST', api.rootPath + api.mapping.commit)
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
      });

      describe('revert', function() {
        it('should provide a revert mecanism', function() {
          var oldCwp = _.clone(ctrlroomManager.getCwp(22));
          ctrlroomManager.addSectors(22, ['UF']);
          ctrlroomManager.revert();
          ctrlroomManager.getCwp(22).should.eql(oldCwp);
        });

        it('should support multiple calls', function() {
          var cwp22 = _.clone(ctrlroomManager.getCwp(22));
          ctrlroomManager.addSectors(22, ['UF']);
          ctrlroomManager.revert();
          ctrlroomManager.revert();
          ctrlroomManager.getCwp(22).should.eql(cwp22);
        });

        it('should support multiple changes', function() {
          var cwp22 = _.clone(ctrlroomManager.getCwp(22));
          var cwp20 = _.clone(ctrlroomManager.getCwp(20));

          ctrlroomManager.addSectors(22, ['UF']);
          // Bind UF to CWP#22, 22 is now ['UF'], 20 is now ['KD', 'KF']
          ctrlroomManager.addSectors(22, ['KF'])
          // 22 is now ['UF', 'KF'], 20 is now ['KD']
          ctrlroomManager.revert();

          ctrlroomManager.getCwp(22).should.eql(cwp22);
          ctrlroomManager.getCwp(20).should.eql(cwp20);
        });
      });

      describe('hasChanges', function() {
        it('should set to true when changes happen', function() {
          ctrlroomManager.hasChanges().should.eql(false);
          ctrlroomManager.addSectors(22, ['UF']);
          ctrlroomManager.hasChanges().should.eql(true);
        });

        it('should revert to false when changes are reverted', function() {
          ctrlroomManager.addSectors(22, ['UF']);
          ctrlroomManager.revert();
          ctrlroomManager.hasChanges().should.eql(false);
        });

        it('should revert to false when changes are commited', function(done) {
          ctrlroomManager.addSectors(22, ['UF']);
          ctrlroomManager.commit()
          .then(function() {
            ctrlroomManager.hasChanges().should.eql(false);
            done();
          });
          $httpBackend.flush();
        });
      });

      describe('commit', function() {
        it('should succeed', function() {
          ctrlroomManager.commit().should.be.fulfilled;
          $httpBackend.flush();
        });

        it('should call refresh from backend', function(done) {
          ctrlroomManager.refresh = sinon.stub().returns($q.resolve(true));
          ctrlroomManager.commit()
          .then(function() {
            ctrlroomManager.refresh.should.have.been.called;
            done();
          });

          $httpBackend.flush();
        });

        it('should actually refresh stuff', function(done) {
          ctrlroomManager.addSectors(22, ['UF']);
          var changedResults = [
            {
              cwpId: 20,
              sectors: [
                "KD",
                "KF"
              ]
            },
            {
              cwpId: 21,
              sectors: [
                "HH",
                "KH",
                "UH",
                "XH"
              ]
            },
            {
              cwpId: 22,
              sectors: ["UF"]
            }
          ];
          backend.getMap
            .respond(changedResults);

          ctrlroomManager.commit()
          .then(function() {
            ctrlroomManager.getCwp(22).sectors.should.eql(['UF']);
            done();
          });

          $httpBackend.flush();
        });

        describe('failure', function() {

          beforeEach(function() {
            backend.commit.respond(404, '');
          });

          it('should fail gracefully', function(done) {
            ctrlroomManager.commit().should.be.rejected.and.notify(done);
            $httpBackend.flush();
          });

          it('should preserve changes', function(done) {
            ctrlroomManager.addSectors(22, ['UF']);
            ctrlroomManager.commit()
            .catch(function() {
              ctrlroomManager.hasChanges().should.eql(true);
              done();
            });
            $httpBackend.flush();
          });
        });

      });
    });

  });
});
