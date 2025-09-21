Follow these steps to create your test admin and configure your backend for E2EE decryption:

1.  **Install Local Dependencies:**
    Ensure your local Python environment has all project dependencies, including `pynacl`, installed. Navigate to your backend directory (`sirr\backend`) and run:
    ```bash
    uv sync
    ```
    This ensures `poe python generate_keys.py` (if you were to run it directly) would work, and keeps your local virtual environment up-to-date.

2.  **Rebuild Docker Images:**
    Any changes to `pyproject.toml` (like adding `pynacl`) require your Docker images to be rebuilt. This ensures the `pynacl` library is available inside your `sirr_api` container.
    From your backend directory (`sirr\backend`):
    ```bash
    poe build
    ```

3.  **Start Docker Development Services:**
    After the image rebuild is complete, start your Docker services. Keep this terminal window open.
    ```bash
    poe dev
    ```
    Verify that the `sirr_api` service starts successfully and connects to the database without errors.

4.  **Run the Automated Admin Creation Command:**
    In a **new terminal window** (keep `poe dev` running in the first), navigate to your backend directory (`sirr\backend`).
    Execute the automated command, providing the desired username, email, and password:
    ```bash
    poe create_test_admin --username=testadmin --email=test@sirr.com --password=yoursecurepassword
    ```
    (Replace `testadmin`, `test@sirr.com`, and `yoursecurepassword` with your actual testing credentials.)

    The command will output the newly generated private key and confirm the creation of the superuser.

5.  **Update Your `.env` File:**
    From the output of the `poe create_test_admin` command, copy the complete line starting with `ADMIN_PRIVATE_KEY=...`.
    Open your `.env` file and replace the existing `ADMIN_PRIVATE_KEY` value with the new one you just copied.
    ```diff
    # .env
    # ...
    + ADMIN_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx= # Paste your new private key here
    # ...
    ```
    Save the `.env` file.

6.  **Restart Docker Services (Final Step):**
    Go back to your first terminal where `poe dev` is running. Press `Ctrl+C` to stop it.
    Then, run `poe dev` again:
    ```bash
    poe dev
    ```
    This final restart ensures that the `sirr_api` service loads the updated `ADMIN_PRIVATE_KEY` environment variable, enabling it to decrypt reports sent to the newly created admin.

---

### Verification

*   **Django Admin:** Access `http://localhost:8000/admin/` and log in with the `testadmin` credentials. Check the `Users` section to confirm your `testadmin` exists and has a `public_key_bundle` populated.
*   **Frontend Submission:** Use your frontend application to submit a test report. The backend should now be able to receive and process it.