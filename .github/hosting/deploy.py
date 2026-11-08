"""Publish only the static GREEN site to its dedicated, jailed FTPS account."""
from __future__ import annotations

import os
from pathlib import Path
import ssl
import sys
from ftplib import FTP, FTP_TLS, error_perm

ROOT = Path(__file__).resolve().parents[2]
CERTIFICATE = Path(__file__).with_name("vh167.hoster.by.pem")


def site_files():
    files = [ROOT / "index.html"]
    for directory in ("css", "js", "assets"):
        files.extend(sorted(p for p in (ROOT / directory).rglob("*") if p.is_file()))
    for path in files:
        if path.is_symlink() or not path.resolve().is_relative_to(ROOT):
            raise ValueError(f"Invalid publication path: {path.name}")
        if path.stat().st_size == 0:
            raise ValueError(f"Empty publication file: {path.name}")
    # Publish the HTML only after all of its dependencies have arrived.
    return sorted(files, key=lambda path: path.name == "index.html")


class DeploymentFTP(FTP_TLS):
    def ntransfercmd(self, cmd, rest=None):
        connection, size = FTP.ntransfercmd(self, cmd, rest)
        if self._prot_p:
            connection = self.context.wrap_socket(
                connection, server_hostname=self.host, session=self.sock.session
            )
        return connection, size


def publish(files):
    password = os.environ["GREEN_FTP_PASSWORD"]
    host = os.environ.get("GREEN_FTP_HOST", "vh167.hoster.by")
    user = os.environ.get("GREEN_FTP_USER", "h219396_green_actions")
    context = ssl.create_default_context(cafile=str(CERTIFICATE))
    context.minimum_version = ssl.TLSVersion.TLSv1_2
    with DeploymentFTP(context=context, timeout=60) as ftp:
        ftp.connect(host, 21)
        ftp.login(user, password)
        ftp.prot_p()
        # This FTP account must be jailed by ISPmanager to /www/igra.green-market.by.
        ftp.cwd("/")
        directories = {""}
        for path in files:
            relative = path.relative_to(ROOT).as_posix()
            parent = ""
            for part in relative.split("/")[:-1]:
                parent = f"{parent}/{part}".lstrip("/")
                if parent not in directories:
                    try:
                        ftp.mkd("/" + parent)
                    except error_perm:
                        ftp.cwd("/" + parent)  # Confirm it exists; do not hide other errors.
                        ftp.cwd("/")
                    directories.add(parent)
            temporary = "/" + relative + ".green-upload"
            with path.open("rb") as stream:
                ftp.storbinary("STOR " + temporary, stream)
            ftp.rename(temporary, "/" + relative)
            print("Published", relative)
    print(f"Published {len(files)} files to https://igra.green-market.by/")


if __name__ == "__main__":
    files = site_files()
    if "--check" in sys.argv:
        print(f"Publication contains {len(files)} files, {sum(p.stat().st_size for p in files)} bytes")
    else:
        publish(files)
