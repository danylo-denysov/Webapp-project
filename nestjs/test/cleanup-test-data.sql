-- Cleanup script for E2E test data
-- Run this manually if tests fail to cleanup properly

-- Delete test users created during E2E tests
-- These will CASCADE delete related boards, tasks, comments, etc.

DELETE FROM "user"
WHERE email LIKE '%@example.com'
   OR email LIKE 'test-%@%'
   OR email LIKE 'board-user-%@%'
   OR email LIKE 'task-user-%@%'
   OR email LIKE 'login-test-%@%'
   OR email LIKE 'flow-test-%@%'
   OR email LIKE 'profile-test-%@%'
   OR email LIKE 'second-%@%'
   OR email LIKE 'other-%@%'
   OR email LIKE 'outsider-%@%'
   OR email LIKE 'nonmember-%@%'
   OR username LIKE 'testuser-%'
   OR username LIKE 'boarduser-%'
   OR username LIKE 'taskuser-%'
   OR username LIKE 'loginuser-%'
   OR username LIKE 'flowuser-%'
   OR username LIKE 'profileuser-%'
   OR username LIKE 'seconduser-%'
   OR username LIKE 'secondtaskuser-%'
   OR username LIKE 'otheruser-%'
   OR username LIKE 'outsider-%'
   OR username LIKE 'nonmember-%';

-- Delete orphaned boards (just in case)
DELETE FROM board WHERE name LIKE '%Alpha%' OR name LIKE 'Temporary Board' OR name LIKE 'Task Management Board';

-- Delete orphaned task groups
DELETE FROM task_group WHERE name IN ('To Do', 'In Progress', 'Done', 'Development Checklist');
