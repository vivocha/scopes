import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { Scopes } from "./../../dist/index";

const should = chai.should();
chai.use(chaiAsPromised);

describe("Scopes", function() {
  it("should return all the scopes as an array", function() {
    let s = new Scopes(["a.x", "-a.z"]);
    s.toArray().should.have.length(2);
  });

  it("should create an empty scopes descriptor", function() {
    let s = new Scopes();
    s.match("a.x").should.equal(false);
    s.match(["a.x"]).should.equal(false);
    s.match(new Scopes("+a.x")).should.equal(false);
    s.match("-a.x").should.equal(true);
    s.match(new Scopes("-a.x")).should.equal(true);
  });

  it("should use a negative wildcard scope when defined", function() {
    let s = new Scopes(["a", "-*.x"]);
    s.match("a.x").should.equal(false);
    s.match("b.x").should.equal(false);
    s.match("a.y").should.equal(true);
    s.match("b.y").should.equal(false);

    s = new Scopes(["-a", "*.x"]);
    s.match("a.x").should.equal(false);
    s.match("b.x").should.equal(true);
    s.match("a.y").should.equal(false);
    s.match("b.y").should.equal(false);
  });

  it("should throw if bad scopes are passed", function() {
    should.throw(function() {
      let s = new Scopes([""]);
    }, RangeError);
  });

  it("should filter scopes", function() {
    let ref1 = new Scopes(["a.*", "-a.x", "*.z"]);
    ref1
      .filter("a.x a.y c.x c.y c.z")
      .toArray()
      .should.deep.equal(["a.y", "c.z"]);
    ref1
      .filter(["a.x", "a.y", "c.x", "c.y", "c.z"])
      .toArray()
      .should.deep.equal(["a.y", "c.z"]);
    ref1
      .filter(new Scopes(["a.x", "a.y", "c.x", "c.y", "c.z"]))
      .toArray()
      .should.deep.equal(["a.y", "c.z"]);

    let ref2 = new Scopes(["*", "-*.x", "-c"]);
    ref2
      .filter("a.x a.y c.x c.y c.z")
      .toArray()
      .should.deep.equal(["-*.x", "a.y"]);
    ref2
      .filter(["a.x", "a.y", "b.x", "b.y", "b.z"])
      .toArray()
      .should.deep.equal(["-*.x", "a.y", "b.y", "b.z"]);
    ref2
      .filter(new Scopes(["a", "c"]))
      .toArray()
      .should.deep.equal(["-*.x", "a.*"]);
    ref2
      .filter(new Scopes(["*"]))
      .toArray()
      .should.deep.equal(["-*.x", "*.*", "-c.*"]);
    ref2
      .filter(new Scopes(["*.x", "*.y"]))
      .toArray()
      .should.deep.equal(["-*.x", "*.y"]);
    ref2
      .filter("d.*")
      .toArray()
      .should.deep.equal(["-*.x", "d.*"]);

    let ref3 = new Scopes(["a", "b", "-c"]);
    ref3
      .filter("*.x")
      .toArray()
      .should.deep.equal(["a.x", "b.x"]);
    ref3
      .filter("*")
      .toArray()
      .should.deep.equal(["a.*", "b.*"]);
    ref3
      .filter("* -*.x")
      .toArray()
      .should.deep.equal(["a.*", "b.*", "-*.x"]);
    ref3
      .filter("d.*")
      .toArray()
      .should.deep.equal([]);

    let ref4 = new Scopes(["*.x", "-*.y"]);
    ref4
      .filter("d.*")
      .toArray()
      .should.deep.equal(["-*.y", "d.x"]);

    let ref5 = new Scopes(["a"]);
    ref5
      .filter("a.* -a.y")
      .toArray()
      .should.deep.equal(["a.*", "-a.y"]);
  });

  it("should return scopes as string", function() {
    let s = new Scopes(["a", "b", "-c"]);
    s.toString().should.eq("a.* b.* -c.*");

    s = new Scopes('*');
    s.toString().should.eq('*.*');
  });

  it("should test README examples", function() {
    const s = new Scopes(["User.*", "-User.create", "Sessions.read", "*.update"]);
    s.match("User.read").should.be.true;
    s.match("User.create").should.be.false;
    s.match("Session.delete").should.be.false;
    s.match("Asset.update").should.be.true;

    const s2 = new Scopes("*");
    s2.match("User.delete").should.be.true;
    s2.match("Account.update").should.be.true;

    const s3 = new Scopes("*.delete");
    s3.match("User.delete").should.be.true;
    s3.match("Account.update").should.be.false;

    const s4 = new Scopes("User.*");
    s4.match("User.create").should.be.true;
    s4.match("User.read").should.be.true;
    s4.match("User.update").should.be.true;
    s4.match("User.delete").should.be.true;
    s4.match('Accound.read').should.be.false;

    const s5 = new Scopes(["User.*"]);
    s5
      .filter("User.delete")
      .toArray()
      .should.deep.equal(["User.delete"]);

    const s6 = new Scopes(["User.*", "-User.delete", "*.read"]);
    s6
      .filter("User.delete User.update Asset.delete Asset.update Asset.read")
      .toArray()
      .should.deep.equal(["User.update", "Asset.read"]);
  });
});
