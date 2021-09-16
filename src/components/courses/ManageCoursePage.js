import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import * as courseActions from "../../redux/actions/courseActions";
import * as authorActions from "../../redux/actions/authorActions";
import PropTypes from "prop-types";
import CourseForm from "./CourseForm";
import { newCourse } from "../../../tools/mockData";
import Spinner from "../common/Spinner";
import { toast } from "react-toastify";

function ManageCoursePage({
  courses,
  authors,
  loadAuthors,
  loadCourses,
  saveCourse,
  history,
  ...props
}) {
  // When we redirect we have all the courses loaded in redux from the previous component.
  // So redux store have have access to courses and we can get the course by id and populate the component.
  // If we copy and paste the URL, which means directly loading the component the call to load courses is
  // not completed yet and we can't get course by id untill the call the completed.
  // When the call is completed we get the course but it is not passed to the course form component
  // because on initil load we made a copy of the course from props which is
  // const [course, setCourse] = useState({ ...props.course });
  // And this will not give use the new state fo the course because state can only be changed in this case via setCourse method
  // In order to solve it since useEffect only run once we need to add a property such that when it changes
  // useEffect is executed again and we can set the course accordingly.

  const [course, setCourse] = useState({ ...props.course });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (courses.length === 0) {
      loadCourses().catch((error) => {
        alert("loading courses failed" + error);
      });
    } else {
      setCourse({ ...props.course });
    }

    if (authors.length === 0) {
      loadAuthors().catch((error) => {
        alert("authors courses failed" + error);
      });
    }
  }, [props.course]);

  function handleChange(event) {
    const { name, value } = event.target;
    setCourse((prevCourse) => ({
      ...prevCourse,
      [name]: name === "authorId" ? parseInt(value, 10) : value,
    }));
  }

  function fromIsValid() {
    const {title, author, category} = course;
    const errors = {};

    if(!title) errors.title = "Title is required";
    if(!author) errors.author = "Author is required";
    if(!category) errors.category = "Category is required";

    setErrors(errors);

    // Form is valid if the errors object still has no properties
    return Object.keys(errors).length === 0;
  }

  function handleSave(event) {
    event.preventDefault();
    if(!fromIsValid()) return;
    setSaving(true);
    saveCourse(course).then(() => {
      toast.success("Course saved");
      history.push("/courses");
    }).catch(error => {
      setSaving(false);
      setErrors({ onSave: error.message});
    });
  }

  return authors.length === 0 || courses.length === 0 ? (
    <Spinner />
  ) : (
    <CourseForm
      course={course}
      errors={errors}
      authors={authors}
      onChange={handleChange}
      onSave={handleSave}
      saving= {saving}
    />
  );
}

ManageCoursePage.propTypes = {
  course: PropTypes.object.isRequired,
  authors: PropTypes.array.isRequired,
  courses: PropTypes.array.isRequired,
  loadCourses: PropTypes.func.isRequired,
  loadAuthors: PropTypes.func.isRequired,
  saveCourse: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

// Selectors in redux
export function getCourseBySlug(courses, slug) {
  return courses.find((course) => course.slug === slug) || null;
}

// If you expose the entire redux store, then the component will rerender when any data changes in the redux store
// ownProps automatically populated by redux
function mapStateToProps(state, ownProps) {
  const slug = ownProps.match.params.slug;
  const course =
    slug && state.courses.length > 0
      ? getCourseBySlug(state.courses, slug)
      : newCourse;
  return {
    course: course,
    courses: state.courses,
    authors: state.authors,
  };
}

const mapDispatchToProps = {
  loadCourses: courseActions.loadCourses,
  loadAuthors: authorActions.loadAuthors,
  saveCourse: courseActions.saveCourse,
};

const connectedStateAndProps = connect(mapStateToProps, mapDispatchToProps);
export default connectedStateAndProps(ManageCoursePage);
