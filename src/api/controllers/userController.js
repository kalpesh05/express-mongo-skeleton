const { userService, tokenService } = require("../../services");
const {
  sprintModel,
  userProductModel,
  skillHistoryModel
} = require("../../models");
const { groupBy } = require("lodash");
const moment = require("moment-timezone");
class userController {
  /**
   * Get All User
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      return res.json({
        data: users
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Update User Profile
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  async updateProfile(req, res, next) {
    let { user, body } = req;
    let { update, getOneWhere } = userService;
    try {
      /**
       * upate user data
       */
      let userUpdate = await update(user._id, body);
      if (!userUpdate) throw new Error(DATABASE_INTERNAL);

      /**
       * find user profile after update
       */

      let userData = await getOneWhere({ _id: user._id, deleted_at: null });
      if (!userData) throw new Error(DATABASE_INTERNAL);

      /**
       * API response
       */
      return res.send({
        message: "",
        data: userData
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Add extra field to User
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  async extraFieldCreate(req, res, next) {
    let { user, body } = req;
    let { addExtraField, getOneWhere } = userService;
    try {
      // /**
      //  * upate user data
      //  */
      // let userUpdate = await update(user._id, body);
      // if (userUpdate.error) throw new Error(DATABASE_INTERNAL);

      /**
       * find user
       */

      let userData = await getOneWhere({ _id: user._id, deleted_at: null });
      if (!userData) throw new Error(DATABASE_INTERNAL);

      let extraField = await addExtraField(userData.data, body);
      // console.log(extraField);
      if (!extraField) throw new Error(DATABASE_INTERNAL);

      /**
       * API response
       */
      return res.send({
        message: "",
        data: extraField
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Update extra field to User
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  async extraFieldUpdate(req, res, next) {
    let { user, body } = req;
    let { updateExtraField, getOneWhere } = userService;
    try {
      // /**
      //  * upate user data
      //  */
      // let userUpdate = await update(user._id, body);
      // if (userUpdate.error) throw new Error(DATABASE_INTERNAL);

      /**
       * find user
       */

      let userData = await getOneWhere({ _id: user._id, deleted_at: null });
      if (!userData) throw new Error(DATABASE_INTERNAL);

      let extraField = await updateExtraField(userData.data, body.index, body);
      if (!extraField) throw new Error(DATABASE_INTERNAL);

      /**
       * API response
       */
      return res.send({
        message: "",
        data: extraField
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get  User Dashboard Detail
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  async getUserReport(req, res, next) {
    // let { user_id } = req.param;
    try {
      let Report = {};
      let Workspaces = [];
      const user = await userService.getOne(req.user._id);
      let skills = groupBy(user.acquired_skills, "workspace_id");
      // console.log(skills);
      const userProduct = await userProductModel.find({
        user_id: req.user._id
      });
      const sprint = await sprintModel.find(
        {
          user_id: req.user._id,
          "sprint_stories.sprint_story_tickets.status": "backlog"
        },
        {
          "sprint_stories.sprint_story_tickets": 1,
          _id: 0,
          user_product_id: 1,
          updated_by: 0,
          created_by: 0
        }
      );

      let userProductSprint = groupBy(sprint, "user_product_id");
      userProduct.map(v => {
        let result = {};
        result._id = v.workspace._id;
        result.title = v.workspace.title;
        // result.role_id = workspace.role._id;
        result.role_title = v.workspace.role.title;
        // result.product_includes = workspace.product.includes;
        result.company_name = v.workspace.employer.company_name;
        result.company_logo_url = v.workspace.employer.company_logo_url;
        // result.required_languages = workspace.required_languages;
        result.description_body_text = v.workspace.description_body_text;
        result.description_body_html = v.workspace.description_body_html;
        result.completed_perc = userProductSprint[v._id]
          .map(s =>
            s.sprint_stories.length === 0
              ? 0
              : s.sprint_stories
                  .map(
                    v =>
                      (v.sprint_story_tickets.filter(t => t.status === "done")
                        .length *
                        100) /
                      v.sprint_story_tickets.length
                  )
                  .reduce((a, b) => a + b, 0)
          )
          .reduce((a, b) => a + b, 0);
        result.skills = skills[v.workspace._id];
        result.xp_gained =
          skills && skills[v._id]
            ? skills[v._id].map(v => v.xp).reduce((a, b) => a + b, 0)
            : 0;
        result.task_completed =
          sprint.length > 0
            ? sprint
                .map(v =>
                  v.sprint_stories
                    .map(
                      t =>
                        t.sprint_story_tickets.filter(
                          st => st.status === "done"
                        ).length
                    )
                    .reduce((a, b) => a + b, 0)
                )
                .reduce((a, b) => a + b, 0)
            : 0;
        // console.log(v._id);
        Workspaces.push(result);
      });

      Report.skills = user.acquired_skills;
      Report.total_xp =
        user.acquired_skills.length > 0
          ? user.acquired_skills.map(v => v.xp).reduce((a, b) => a + b, 0)
          : 0;
      Report.workspaces = Workspaces;
      Report.workspace_count = Workspaces.length;
      return res.json({
        data: Report
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get User Xp Timeline
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  async getUserXpTimeLine(req, res, next) {
    let { user_id } = req.param;
    let {
      by = "date",
      start_date = null,
      end_date = moment().format("YYYY-MM-DD")
    } = req.query;
    try {
      let total_xp = { label: [], data: [] };
      let history = [];
      // console.log(">>", { $lte: new Date(`${start}`) });
      let skillHistory = start_date
        ? await skillHistoryModel.find({
            user_id: req.user._id,
            created_at: {
              $gte: moment(`${start_date}`)
                .startOf("day")
                .toDate(),
              $lt: moment(`${end_date}`)
                .startOf("day")
                .add(1, "day")
                .toDate()
            }
          })
        : await skillHistoryModel.find({ user_id: req.user._id });
      let format = by === "date" ? "DD MMM" : "MMMM";
      // console.log(groupBy(skillHistory, "created_at"));
      if (skillHistory.length > 0) {
        skillHistory.map((v, i) => {
          // total_xp.push({})
          console.log(moment(i).format(`${format}`));
          history.push({ by: moment(i).format(`${format}`), xp: v.total_xp });
          // label.push(moment(i).format("DD MMM"));
          // data.push(v.total_xp);
        });

        let skillHistoryBy = groupBy(history, "by");
        // console.log(skillHistoryBy);
        for (let i in skillHistoryBy) {
          total_xp.label.push(i);
          total_xp.data.push(
            skillHistoryBy[i].map(v => v.xp).reduce((a, b) => a + b, 0)
          );
        }
      }
      return res.json({
        data: total_xp
      });
    } catch (e) {
      return next(e);
    }
  }
}

module.exports = new userController();
