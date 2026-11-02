/*

    focalsrv.tests.ts - Test Cases for the Focal server backend.
    TODO: Actually ensuring these pass and work as intended, as these
    tests currently are having issues
    TODO: Build a test database or creating a mock database, further research needs to be done.

*/

//import assert from "node:assert/strict";
import request from "supertest";
import { describe, expect, it } from "vitest";

import focalSrv from "../src/index.js";

// User account signup
describe("POST /api/auth/signup", () => {
    it("should return 201 Created(", async () => {
        const credentials = { email: "TestAcc@Test.com", username: "TestAccount", password: "testingpassword" };
        return await request(focalSrv)
            .post('/api/auth/signup')
            .send(credentials)
            .set("Accept", "application/json")
            .expect("Content-Type", "application/json; charset=utf-8")
            // TODO: This current fails here, and I suspect it's because of the expectation above, or poor writing
            // of this test, at the moment I can't check properly.
            .expect(201)
            .then(response => {
                expect(response.body.username).toEqual(credentials.username);
                expect(response.body.email).toEqual(credentials.email);
            });
    });
});

// User account login
describe("POST /api/auth/login", async () => {
    const credentials = { email: "TestAcc@Test.com", password: "testingpassword" };
    const username = "TestAccount"
    return await request(focalSrv)
    .post("/api/auth/login")
    .send(credentials)
    .set("Accept", "application/json")
    .expect("Content-Type", "application/json; charset=utf-8")
    // I suspect this test will fail here too, for the same reason as the previous test.
    .expect(200)
    .then(response => {
        expect(response.body.user.username).toEqual(username);
    });
});