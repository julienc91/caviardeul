from ninja import Schema
from pydantic import Field, model_validator

from caviardeul.services.encryption import encrypt_data, generate_encryption_key


class BaseEncryptedArticleSchema(Schema):
    key: str = Field(default_factory=generate_encryption_key)
    content: str
    pageName: str

    @model_validator(mode="after")
    def check_passwords_match(self):
        self.content = encrypt_data(self.content, self.key)
        self.pageName = encrypt_data(self.pageName, self.key)
        return self
