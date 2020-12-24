import React, {useEffect, useRef, useState} from "react";
import {Button, TextField} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import PropTypes from "prop-types";

import SignUpForm from "./SignUpForm";

import auth from "../../../api/auth";
import {Link} from "react-router-dom";

const LoginForm = ({ onSuccess, reqParams }) => {
  const [showAlert, setAlert] = useState(null);
  const [isSubmit, setSubmit] = useState(false);
  const [isReady, setReady] = useState(false);
  const [formData, setData] = useState({
    name: {
      value: '',
      error: '',
    },
    pwd: {
      value: '',
      error: '',
    }
  });

  const defaultAlertMsg = "Error while processing request. Please try again later.";

  const handler = (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;

    setData( formData => ({
      ...formData,
      [name]: {
        ...formData[name],
        value
      }
    }));
  };

  const formRef = useRef();
  useEffect(() => {
    const unlockForm = () => {
      let errors = 0;
      for (let field in formData) {
        if (formData[field].error.length) {
          errors++;
        }
      }

      setReady(errors === 0 && formRef.current.checkValidity());
    };

    unlockForm();
  }, [formData, isReady]);

  useEffect(() => {
    const fetchData = async () => {
      const params = {
        name: formData.name.value,
        pwd: formData.pwd.value,
      };

      try {
        const { data } = await auth.logIn(params, reqParams);
        onSuccess({
          name: formData.name.value,
          token: data.eval.privatekey,
        });
        return;
      } catch (error) {
        if (error.response && error.response.data){
          setAlert(error.response.data.message);
        } else {
          setAlert(defaultAlertMsg);
        }
      }

      setSubmit(false);
    };

    if (isSubmit) {
      fetchData();
    }
  }, [isSubmit]);

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmit(true);
  };

  const forgetPwdText = <>If you forget your password, please follow the <Link to={"/reset-password"}>link</Link> to reset it.</>;

  return <form className="login-form" autoComplete="off" onSubmit={onSubmit} ref={formRef}>
    {showAlert && <Alert
      className="form-alert"
      severity="error"
      onClose={() => setAlert(null)}>
      {showAlert}
    </Alert>}

    <div className="form-item">
      <TextField
        name="name"
        label="Nickname"
        placeholder="Enter your nickname"
        required={true}
        variant="outlined"
        onChange={handler}
        value={formData.name.value}
        error={(formData.name.error.length > 0)}
        helperText={formData.name.error ? formData.name.error : ''}
        fullWidth={true}
      />
    </div>
    <div className="form-item">
      <TextField
        name="pwd"
        label="Password"
        placeholder="Enter strong password"
        type="password"
        required={true}
        variant="outlined"
        onChange={handler}
        value={formData.pwd.value}
        error={(formData.pwd.error.length > 0)}
        helperText={formData.pwd.error ? formData.pwd.error : forgetPwdText}
        fullWidth={true}
      />
    </div>
    <Button variant="outlined" type="submit" color="primary" disabled={isReady !== true}>Continue</Button>
  </form>;
};

SignUpForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
};

export default LoginForm;
