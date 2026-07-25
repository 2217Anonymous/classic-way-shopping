from __future__ import annotations

from app.modules.catalog.models.product import Product
from app.modules.catalog.repositories.brand_repository import BrandRepository
from app.modules.catalog.repositories.category_repository import CategoryRepository
from app.modules.catalog.repositories.product_repository import ProductRepository
from app.modules.catalog.schemas.product import (
    ProductAttributeResponse,
    ProductMediaResponse,
    ProductResponse,
    ProductVariantResponse,
)


class ProductMapper:
    """Read-only product → response mapping for the storefront."""

    def __init__(
        self,
        repository: ProductRepository,
        category_repository: CategoryRepository,
        brand_repository: BrandRepository | None = None,
    ):
        self.repository = repository
        self.category_repository = category_repository
        self.brand_repository = brand_repository

    def _to_response(self, product: Product) -> ProductResponse:
        media = [
            ProductMediaResponse.model_validate(item)
            for item in sorted(
                product.media, key=lambda row: (row.sort_order, row.id)
            )
        ]
        primary = next((item.url for item in media if item.is_primary), None)
        if not primary and media:
            primary = media[0].url

        category_name = None
        if product.category_id:
            category = self.category_repository.get(product.category_id)
            category_name = category.name if category else None

        attributes = [
            ProductAttributeResponse.model_validate(item)
            for item in sorted(
                product.attributes, key=lambda row: (row.sort_order, row.id)
            )
        ]
        variants = [
            ProductVariantResponse.model_validate(item)
            for item in sorted(
                product.variants, key=lambda row: (row.sort_order, row.id)
            )
        ]

        return ProductResponse(
            id=product.id,
            name=product.name,
            slug=product.slug,
            description=product.description,
            short_description=product.short_description,
            price=product.price,
            compare_at_price=product.compare_at_price,
            discount_percent=product.discount_percent,
            sku=product.sku,
            manufacturer_name=product.manufacturer_name,
            manufacturer_brand=product.manufacturer_brand,
            stock=product.stock,
            tags=product.tags,
            visibility=product.visibility,
            published_at=product.published_at,
            category_id=product.category_id,
            category_name=category_name,
            brand_id=getattr(product, "brand_id", None),
            is_published=product.is_published,
            is_active=product.is_active,
            is_featured=getattr(product, "is_featured", False),
            is_trending=getattr(product, "is_trending", False),
            is_best_seller=getattr(product, "is_best_seller", False),
            seo_title=getattr(product, "seo_title", None),
            seo_description=getattr(product, "seo_description", None),
            exchangeable=product.exchangeable,
            refundable=product.refundable,
            sort_order=product.sort_order,
            primary_image_url=primary,
            media=media,
            attributes=attributes,
            variants=variants,
            created_at=product.created_at,
            updated_at=product.updated_at,
            deleted_at=getattr(product, "deleted_at", None),
        )


# Alias used by storefront catalog service
ProductService = ProductMapper
