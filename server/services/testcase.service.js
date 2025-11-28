const TestCase = require("../models/TestCase");
const TestSuite = require("../models/TestSuite");
const TestCaseVersion = require("../models/TestCaseVersion");
const TestCaseAttachment = require("../models/TestCaseAttachment");
const TestCaseTaskRelation = require("../models/TestCaseTaskRelation");
const User = require("../models/User");
const Task = require("../models/Task");
const ApiError = require("../utils/ApiError");
const { Op } = require("sequelize");

class TestCaseService {
  // Generate unique testcase code
  async generateTestCaseCode(projectId) {
    const prefix = "TC";
    const lastTestCase = await TestCase.findOne({
      where: {
        project_id: projectId,
        testcase_code: {
          [Op.like]: `${prefix}%`,
        },
      },
      order: [["testcase_id", "DESC"]],
    });

    if (!lastTestCase) {
      return `${prefix}001`;
    }

    const lastNumber = parseInt(lastTestCase.testcase_code.replace(prefix, ""));
    const nextNumber = lastNumber + 1;
    return `${prefix}${nextNumber.toString().padStart(3, "0")}`;
  }

  // Create new testcase
  async createTestCase(projectId, userId, data) {
    const testcaseCode = await this.generateTestCaseCode(projectId);

    const testcase = await TestCase.create({
      project_id: projectId,
      suite_id: data.suite_id || null,
      testcase_code: testcaseCode,
      name: data.name,
      description: data.description || null,
      priority: data.priority || "medium",
      pre_condition: data.pre_condition || null,
      steps: data.steps || [],
      expected_result: data.expected_result || null,
      actual_result: data.actual_result || null,
      status: data.status || "draft",
      created_by: userId,
      version: 1,
    });

    // Create initial version
    await TestCaseVersion.create({
      testcase_id: testcase.testcase_id,
      version_number: 1,
      name: testcase.name,
      description: testcase.description,
      priority: testcase.priority,
      pre_condition: testcase.pre_condition,
      steps: testcase.steps,
      expected_result: testcase.expected_result,
      actual_result: testcase.actual_result,
      status: testcase.status,
      updated_by: userId,
    });

    // Create task relations if provided
    if (data.related_tasks && data.related_tasks.length > 0) {
      for (const taskId of data.related_tasks) {
        await TestCaseTaskRelation.create({
          testcase_id: testcase.testcase_id,
          task_id: taskId,
          relation_type: "testcase",
        });
      }
    }

    return this.getTestCaseById(testcase.testcase_id);
  }

  // Get testcase by ID
  async getTestCaseById(testcaseId) {
    const testcase = await TestCase.findByPk(testcaseId, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["user_id", "first_name", "last_name", "email", "avatar"],
        },
        {
          model: User,
          as: "updater",
          attributes: ["user_id", "first_name", "last_name", "email", "avatar"],
        },
        {
          model: TestSuite,
          as: "suite",
          attributes: ["suite_id", "name"],
        },
        {
          model: TestCaseAttachment,
          as: "attachments",
        },
        {
          model: TestCaseTaskRelation,
          as: "taskRelations",
          include: [
            {
              model: Task,
              as: "task",
              attributes: ["task_id", "title", "status_id", "type"],
            },
          ],
        },
      ],
    });

    if (!testcase) {
      throw new ApiError("Test case not found", 404);
    }

    return testcase;
  }

  // Get all testcases for project with filters
  async getTestCases(projectId, filters = {}) {
    const where = { project_id: projectId };

    if (filters.suite_id) {
      where.suite_id = filters.suite_id;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.created_by) {
      where.created_by = filters.created_by;
    }

    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { testcase_code: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    if (filters.date_from || filters.date_to) {
      where.created_at = {};
      if (filters.date_from) {
        where.created_at[Op.gte] = new Date(filters.date_from);
      }
      if (filters.date_to) {
        where.created_at[Op.lte] = new Date(filters.date_to);
      }
    }

    const testcases = await TestCase.findAll({
      where,
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["user_id", "first_name", "last_name", "email", "avatar"],
        },
        {
          model: User,
          as: "updater",
          attributes: ["user_id", "first_name", "last_name", "email", "avatar"],
        },
        {
          model: TestSuite,
          as: "suite",
          attributes: ["suite_id", "name"],
        },
        {
          model: TestCaseAttachment,
          as: "attachments",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return testcases;
  }

  // Update testcase (creates new version)
  async updateTestCase(testcaseId, userId, data) {
    const testcase = await TestCase.findByPk(testcaseId);

    if (!testcase) {
      throw new ApiError("Test case not found", 404);
    }

    // Increment version
    const newVersion = testcase.version + 1;

    // Update testcase
    await testcase.update({
      suite_id: data.suite_id !== undefined ? data.suite_id : testcase.suite_id,
      name: data.name || testcase.name,
      description:
        data.description !== undefined
          ? data.description
          : testcase.description,
      priority: data.priority || testcase.priority,
      pre_condition:
        data.pre_condition !== undefined
          ? data.pre_condition
          : testcase.pre_condition,
      steps: data.steps || testcase.steps,
      expected_result:
        data.expected_result !== undefined
          ? data.expected_result
          : testcase.expected_result,
      actual_result:
        data.actual_result !== undefined
          ? data.actual_result
          : testcase.actual_result,
      status: data.status || testcase.status,
      updated_by: userId,
      version: newVersion,
    });

    // Create new version history
    await TestCaseVersion.create({
      testcase_id: testcase.testcase_id,
      version_number: newVersion,
      name: testcase.name,
      description: testcase.description,
      priority: testcase.priority,
      pre_condition: testcase.pre_condition,
      steps: testcase.steps,
      expected_result: testcase.expected_result,
      actual_result: testcase.actual_result,
      status: testcase.status,
      updated_by: userId,
    });

    // Update task relations if provided
    if (data.related_tasks !== undefined) {
      // Remove existing relations
      await TestCaseTaskRelation.destroy({
        where: {
          testcase_id: testcase.testcase_id,
          relation_type: "testcase",
        },
      });

      // Create new relations
      if (data.related_tasks.length > 0) {
        for (const taskId of data.related_tasks) {
          await TestCaseTaskRelation.create({
            testcase_id: testcase.testcase_id,
            task_id: taskId,
            relation_type: "testcase",
          });
        }
      }
    }

    return this.getTestCaseById(testcaseId);
  }

  // Delete testcase
  async deleteTestCase(testcaseId) {
    const testcase = await TestCase.findByPk(testcaseId);

    if (!testcase) {
      throw new ApiError("Test case not found", 404);
    }

    await testcase.destroy();
    return { message: "Test case deleted successfully" };
  }

  // Get version history
  async getVersionHistory(testcaseId) {
    const versions = await TestCaseVersion.findAll({
      where: { testcase_id: testcaseId },
      include: [
        {
          model: User,
          as: "updater",
          attributes: ["user_id", "first_name", "last_name", "email", "avatar"],
        },
      ],
      order: [["version_number", "DESC"]],
    });

    return versions;
  }

  // Upload attachment
  async uploadAttachment(testcaseId, userId, file) {
    const attachment = await TestCaseAttachment.create({
      testcase_id: testcaseId,
      file_name: file.filename,
      file_path: file.path,
      file_size: file.size,
      uploaded_by: userId,
    });

    return attachment;
  }

  // Delete attachment
  async deleteAttachment(attachmentId) {
    const attachment = await TestCaseAttachment.findByPk(attachmentId);

    if (!attachment) {
      throw new ApiError(404, "Attachment not found");
    }

    await attachment.destroy();
    return { message: "Attachment deleted successfully" };
  }

  // Test Suite methods
  async createTestSuite(projectId, userId, data) {
    const suite = await TestSuite.create({
      project_id: projectId,
      parent_suite_id: data.parent_suite_id || null,
      name: data.name,
      description: data.description || null,
      created_by: userId,
    });

    return suite;
  }

  async getTestSuites(projectId) {
    const suites = await TestSuite.findAll({
      where: { project_id: projectId },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["user_id", "first_name", "last_name", "email", "avatar"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // For each suite, get statistics
    const suitesWithStats = await Promise.all(
      suites.map(async (suite) => {
        const stats = await this.getSuiteStatistics(suite.suite_id);
        return {
          ...suite.toJSON(),
          statistics: stats,
        };
      })
    );

    return suitesWithStats;
  }

  async updateTestSuite(suiteId, data) {
    const suite = await TestSuite.findByPk(suiteId);

    if (!suite) {
      throw new ApiError(404, "Test suite not found");
    }

    await suite.update({
      parent_suite_id:
        data.parent_suite_id !== undefined
          ? data.parent_suite_id
          : suite.parent_suite_id,
      name: data.name || suite.name,
      description:
        data.description !== undefined ? data.description : suite.description,
    });

    return suite;
  }

  async deleteTestSuite(suiteId, moveToSuiteId = null) {
    const suite = await TestSuite.findByPk(suiteId);

    if (!suite) {
      throw new ApiError(404, "Test suite not found");
    }

    // If moveToSuiteId is provided, move all children before deleting
    if (moveToSuiteId !== null) {
      // Move child test suites
      await TestSuite.update(
        { parent_suite_id: moveToSuiteId },
        { where: { parent_suite_id: suiteId } }
      );

      // Move test cases
      await TestCase.update(
        { suite_id: moveToSuiteId },
        { where: { suite_id: suiteId } }
      );
    }

    await suite.destroy();
    return { message: "Test suite deleted successfully" };
  }

  // Duplicate test suite
  async duplicateTestSuite(suiteId, targetParentSuiteId, userId) {
    const originalSuite = await TestSuite.findByPk(suiteId);

    if (!originalSuite) {
      throw new ApiError(404, "Test suite not found");
    }

    // Create duplicate suite
    const duplicatedSuite = await TestSuite.create({
      project_id: originalSuite.project_id,
      parent_suite_id: targetParentSuiteId,
      name: `${originalSuite.name} (Copy)`,
      description: originalSuite.description,
      created_by: userId,
    });

    // Duplicate all test cases from original suite
    const testCases = await TestCase.findAll({
      where: { suite_id: suiteId },
    });

    for (const tc of testCases) {
      const testcaseCode = await this.generateTestCaseCode(
        originalSuite.project_id
      );
      await TestCase.create({
        project_id: tc.project_id,
        suite_id: duplicatedSuite.suite_id,
        testcase_code: testcaseCode,
        name: tc.name,
        description: tc.description,
        priority: tc.priority,
        pre_condition: tc.pre_condition,
        steps: tc.steps,
        expected_result: tc.expected_result,
        actual_result: tc.actual_result,
        status: tc.status,
        created_by: userId,
        version: 1,
      });
    }

    // Recursively duplicate child suites
    const childSuites = await TestSuite.findAll({
      where: { parent_suite_id: suiteId },
    });

    for (const childSuite of childSuites) {
      await this.duplicateTestSuite(
        childSuite.suite_id,
        duplicatedSuite.suite_id,
        userId
      );
    }

    return duplicatedSuite;
  }

  // Check if suite has children (test cases or sub-suites)
  async suiteHasChildren(suiteId) {
    const testCaseCount = await TestCase.count({
      where: { suite_id: suiteId },
    });

    const childSuiteCount = await TestSuite.count({
      where: { parent_suite_id: suiteId },
    });

    return {
      hasChildren: testCaseCount > 0 || childSuiteCount > 0,
      testCaseCount,
      childSuiteCount,
    };
  }

  // Get suite statistics (recursive count of test cases and child suites)
  async getSuiteStatistics(suiteId) {
    // Count direct test cases
    const directTestCases = await TestCase.count({
      where: { suite_id: suiteId },
    });

    // Find all child suites
    const childSuites = await TestSuite.findAll({
      where: { parent_suite_id: suiteId },
      attributes: ["suite_id"],
    });

    let totalTestCases = directTestCases;
    let totalChildSuites = childSuites.length;

    // Recursively count test cases and suites in child suites
    for (const childSuite of childSuites) {
      const childStats = await this.getSuiteStatistics(childSuite.suite_id);
      totalTestCases += childStats.testcase_count;
      totalChildSuites += childStats.suite_count;
    }

    return {
      testcase_count: totalTestCases,
      suite_count: totalChildSuites,
    };
  }

  // Get testcases related to a task
  async getTestCasesByTask(taskId) {
    const relations = await TestCaseTaskRelation.findAll({
      where: {
        task_id: taskId,
        relation_type: "testcase",
      },
      include: [
        {
          model: TestCase,
          as: "testcase",
          include: [
            {
              model: User,
              as: "creator",
              attributes: [
                "user_id",
                "first_name",
                "last_name",
                "email",
                "avatar",
              ],
            },
          ],
        },
      ],
    });

    return relations.map((r) => r.testcase);
  }

  // Get test suites related to a task
  async getTestSuitesByTask(taskId) {
    const relations = await TestCaseTaskRelation.findAll({
      where: {
        task_id: taskId,
        relation_type: "suite",
      },
      include: [
        {
          model: TestSuite,
          as: "suite",
          include: [
            {
              model: User,
              as: "creator",
              attributes: [
                "user_id",
                "first_name",
                "last_name",
                "email",
                "avatar",
              ],
            },
          ],
        },
      ],
    });

    return relations.map((r) => r.suite);
  }
}

module.exports = new TestCaseService();
