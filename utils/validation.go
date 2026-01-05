package utils

import (
	"errors"
	"regexp"
	"strings"
	"unicode"
)

var (
	// simple, practical email regex for validation after lowercasing
	emailRegex = regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$`)
	// RFC limit
	maxEmailLength = 254
)

// NormalizeEmail trims spaces and converts an email to lower-case.
func NormalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

// ValidateEmail validates and normalizes an email. It returns the normalized
// email or an error. Use this for creating users.
func ValidateEmail(email string) (string, error) {
	email = NormalizeEmail(email)
	if email == "" {
		return "", errors.New("email is required")
	}
	if len(email) > maxEmailLength {
		return "", errors.New("email is too long")
	}
	if !emailRegex.MatchString(email) {
		return "", errors.New("invalid email format")
	}
	return email, nil
}

// ValidateEmailOptional validates and normalizes an email when the field is
// optional (e.g., editing a profile). Empty string is allowed and returns
// empty string with no error.
func ValidateEmailOptional(email string) (string, error) {
	email = NormalizeEmail(email)
	if email == "" {
		return "", nil
	}
	if len(email) > maxEmailLength {
		return "", errors.New("email is too long")
	}
	if !emailRegex.MatchString(email) {
		return "", errors.New("invalid email format")
	}
	return email, nil
}

// ValidatePassword checks common password rules. Returns nil for valid
// passwords or an error describing the first failing rule.
// Rules:
// - length between 8 and 72 (bcrypt safe)
// - at least one lower-case letter
// - at least one upper-case letter
// - at least one digit
// - at least one symbol (punctuation or symbol characters)
func ValidatePassword(pw string) error {
	// length in runes
	if pw == "" {
		return errors.New("password is required")
	}
	rlen := 0
	var hasLower, hasUpper, hasNumber, hasSymbol bool
	for _, r := range pw {
		rlen++
		switch {
		case unicode.IsLower(r):
			hasLower = true
		case unicode.IsUpper(r):
			hasUpper = true
		case unicode.IsDigit(r):
			hasNumber = true
		case unicode.IsPunct(r) || unicode.IsSymbol(r):
			hasSymbol = true
		}
	}
	if rlen < 8 {
		return errors.New("password must be at least 8 characters")
	}
	if rlen > 72 {
		return errors.New("password must be at most 72 characters")
	}
	if !hasLower {
		return errors.New("password must contain at least one lower-case letter")
	}
	if !hasUpper {
		return errors.New("password must contain at least one upper-case letter")
	}
	if !hasNumber {
		return errors.New("password must contain at least one digit")
	}
	if !hasSymbol {
		return errors.New("password must contain at least one symbol")
	}
	return nil
}

// ValidatePasswordOptional allows empty password (useful in profile edits).
// If non-empty, it runs the same validation rules as ValidatePassword.
func ValidatePasswordOptional(pw string) error {
	if strings.TrimSpace(pw) == "" {
		return nil
	}
	return ValidatePassword(pw)
}
