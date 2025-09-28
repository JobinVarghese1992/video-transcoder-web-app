import { LoadingOverlay, Box } from "@mantine/core";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../auth";
import { setToken } from "../api";

const OAuthloader = () => {
  const nav = useNavigate();
  const { settoken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idToken = params.get("id_token");
    const accessToken = params.get("access_token");

    if (idToken) {
      setToken(idToken);

      settoken(idToken);
    }

    // if (accessToken) {
    //   localStorage.setItem("access_token", accessToken);
    // }

    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);

    nav({ to: "/" });
  }, [nav, settoken]);

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={true}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
    </Box>
  );
};

export default OAuthloader;
