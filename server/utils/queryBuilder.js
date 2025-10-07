const { Op, fn, col } = require("sequelize");
const ApiError = require("../utils/ApiError");

async function getAllWithParams(Model, options = {}, config = {}) {
  try {
    const {
      // Pagination
      page = 1,
      limit = 10,

      // Sorting
      sortBy = config.defaultSortBy || "user_id",
      sortOrder = "ASC",

      // Search
      search = "",
      searchFields = config.searchFields || [],

      // Filters (dynamic)
      ...filters
    } = options;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100);
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = {};

    // 🔍 Search logic
    if (search && search.trim() && searchFields.length > 0) {
      const searchTokens = search.trim().split(/\s+/);

      const searchConditions = searchFields.map((field) => ({
        [Op.and]: searchTokens.map((token) => ({
          [field]: { [Op.like]: `%${token}%` },
        })),
      }));
      whereConditions[Op.or] = searchConditions;
    }

    // filter logic

    for (const key of Object.keys(filters)) {
      const value = filters[key];
      if (value === undefined || value === null || value === "") continue;

      if (key.endsWith("From") || key.endsWith("To")) {
        const baseKey = key.replace(/(From|To)$/, "");
        const parsedDate = new Date(value);

        if (isNaN(parsedDate.getTime())) continue; // Bỏ qua nếu date invalid

        if (!whereConditions[baseKey]) whereConditions[baseKey] = {};

        if (key.endsWith("From")) whereConditions[baseKey][Op.gte] = parsedDate;
        if (key.endsWith("To")) whereConditions[baseKey][Op.lte] = parsedDate;

        // ⚠️ Nếu cả From và To của baseKey đều undefined → Xóa baseKey khỏi whereConditions
        const hasGte = whereConditions[baseKey][Op.gte] !== undefined;
        const hasLte = whereConditions[baseKey][Op.lte] !== undefined;
        if (!hasGte && !hasLte) {
          delete whereConditions[baseKey];
        }
      } else {
        if (Array.isArray(value)) {
          whereConditions[key] = { [Op.in]: value };
        } else {
          whereConditions[key] = value;
        }
      }
    }

    // 🔃 Sorting
    const allowedSortFields = config.sortFields || [sortBy];
    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : config.defaultSortBy || "user_id";
    const sortDirection = ["ASC", "DESC"].includes(sortOrder.toUpperCase())
      ? sortOrder.toUpperCase()
      : "ASC";

    // 🧠 Query execution
    const { count, rows } = await Model.findAndCountAll({
      where: whereConditions,
      order: [[sortField, sortDirection]],
      offset,
      distinct: true,
      limit: limitNum,
      include: config.include || [],
    });

    const totalPages = Math.ceil(count / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    return {
      data: rows,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: count,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPreviousPage,
        nextPage: hasNextPage ? pageNum + 1 : null,
        previousPage: hasPreviousPage ? pageNum - 1 : null,
      },
      filters: filters,
      sorting: {
        sortBy: sortField,
        sortOrder: sortDirection,
      },
      meta: {
        totalFiltered: count,
        queryTime: new Date().toISOString(),
      },
    };
  } catch (error) {
    throw new ApiError(`Query Error: ${error.message}`, 400);
  }
}

module.exports = {
  getAllWithParams,
};
