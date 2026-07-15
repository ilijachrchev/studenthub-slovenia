const {
    isValidEmail,
    validateFieldLength,
    validateRegistration,
    validatePasswordChange,
    validateOrganization,
    validateEvent,
    validateFeedback,
} = require("../middleware/validate");

describe("isValidEmail", () => {
    test("returns true for valid emails", () => {
        expect(isValidEmail("user@example.com")).toBe(true);
        expect(isValidEmail("test.student@famnit.upr.si")).toBe(true);
        expect(isValidEmail("a+b@c.co")).toBe(true);
    });

    test("returns false for invalid emails", () => {
        expect(isValidEmail("")).toBe(false);
        expect(isValidEmail("noatsign")).toBe(false);
        expect(isValidEmail("user@")).toBe(false);
        expect(isValidEmail("@domain.com")).toBe(false);
        expect(isValidEmail("user@domain")).toBe(false);
        expect(isValidEmail(null)).toBe(false);
        expect(isValidEmail(undefined)).toBe(false);
        expect(isValidEmail(123)).toBe(false);
    });
});

describe("validateFieldLength", () => {
    test("returns error when required field is missing", () => {
        expect(validateFieldLength(null, "Name", 100, true)).toBe("Name is required");
        expect(validateFieldLength("", "Name", 100, true)).toBe("Name is required");
        expect(validateFieldLength("   ", "Name", 100, true)).toBe("Name is required");
    });

    test("returns null for valid field", () => {
        expect(validateFieldLength("hello", "Name", 100, true)).toBeNull();
        expect(validateFieldLength(null, "Name", 100, false)).toBeNull();
        expect(validateFieldLength(undefined, "Name", 100, false)).toBeNull();
    });

    test("returns error when field exceeds max length", () => {
        const long = "x".repeat(101);
        expect(validateFieldLength(long, "Name", 100)).toBe("Name must be 100 characters or fewer");
    });

    test("returns null for field at max length", () => {
        const exact = "x".repeat(100);
        expect(validateFieldLength(exact, "Name", 100)).toBeNull();
    });
});

describe("validateRegistration", () => {
    const valid = {
        first_name: "Test",
        last_name: "Student",
        email: "test@example.com",
        password: "secure123",
    };

    test("returns empty array for valid input", () => {
        expect(validateRegistration(valid)).toEqual([]);
    });

    test("requires all fields", () => {
        expect(validateRegistration({})).toContain("First name is required");
        expect(validateRegistration({ first_name: "A" })).toContain("Last name is required");
        expect(validateRegistration({ first_name: "A", last_name: "B" })).toContain("Email is required");
        expect(validateRegistration({ first_name: "A", last_name: "B", email: "a@b.com" })).toContain("Password is required");
    });

    test("validates email format", () => {
        expect(validateRegistration({ ...valid, email: "notanemail" })).toContain("Invalid email format");
    });

    test("validates password minimum length", () => {
        expect(validateRegistration({ ...valid, password: "short" })).toContain("Password must be at least 8 characters");
    });

    test("validates field lengths", () => {
        const long = "x".repeat(256);
        expect(validateRegistration({ ...valid, email: `${long}@example.com` })).toContain("Email must be 255 characters or fewer");
    });
});

describe("validatePasswordChange", () => {
    test("returns empty array for valid password", () => {
        expect(validatePasswordChange({ new_password: "secure123" })).toEqual([]);
    });

    test("requires new password", () => {
        expect(validatePasswordChange({})).toContain("New password is required");
    });

    test("enforces minimum length", () => {
        expect(validatePasswordChange({ new_password: "short" })).toContain("Password must be at least 8 characters");
    });

    test("enforces maximum length", () => {
        const long = "x".repeat(129);
        expect(validatePasswordChange({ new_password: long })).toContain("New password must be 128 characters or fewer");
    });
});

describe("validateOrganization", () => {
    const valid = {
        name: "Test Org",
        contact_email: "org@example.com",
    };

    test("returns empty array for valid input", () => {
        expect(validateOrganization(valid)).toEqual([]);
    });

    test("requires name and contact email", () => {
        expect(validateOrganization({})).toContain("Organization name is required");
        expect(validateOrganization({ name: "Org" })).toContain("Contact email is required");
    });

    test("validates contact email format", () => {
        expect(validateOrganization({ ...valid, contact_email: "bad" })).toContain("Invalid email format");
    });

    test("validates optional field lengths", () => {
        const long = "x".repeat(5001);
        expect(validateOrganization({ ...valid, description: long })).toContain("Description must be 5000 characters or fewer");
    });
});

describe("validateEvent", () => {
    const valid = {
        title: "My Event",
        location: "Room 101",
    };

    test("returns empty array for valid input", () => {
        expect(validateEvent(valid)).toEqual([]);
    });

    test("requires title and location", () => {
        expect(validateEvent({})).toContain("Title is required");
        expect(validateEvent({ title: "Event" })).toContain("Location is required");
    });

    test("validates field lengths", () => {
        const long = "x".repeat(256);
        expect(validateEvent({ ...valid, title: long })).toContain("Title must be 255 characters or fewer");
    });
});

describe("validateFeedback", () => {
    test("returns empty array for valid input", () => {
        expect(validateFeedback({ comment: "Great event!" })).toEqual([]);
    });

    test("returns empty array for null comment", () => {
        expect(validateFeedback({ comment: null })).toEqual([]);
    });

    test("validates comment max length", () => {
        const long = "x".repeat(2001);
        expect(validateFeedback({ comment: long })).toContain("Comment must be 2000 characters or fewer");
    });
});
