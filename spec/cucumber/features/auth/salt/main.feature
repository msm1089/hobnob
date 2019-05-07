Feature: Retrieve Salt and Parameters

  Test that we can create a user using a digest and then retrieve information about the digest's salt and parameters successfully

  Scenario: Retrieve Salt without specifying Email

    When the client creates a GET request to /salt
      And sends the request
    Then our API should respond with a 400 HTTP status code
      And the payload of the response should be a JSON object
      And contains a message property which says "The email field must be specified"

  Scenario: Send Digest and Retrieve Salt

    Given a new user is created with random password and email
    When the client creates a GET request to /salt
      And set a valid Retrieve Salt query string
      And sends the request
    Then our API should respond with a 200 HTTP status code
      And the payload of the response should be a string
      And the payload should be equal to context.salt